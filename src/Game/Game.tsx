import { useEffect, useRef, useState } from 'react';
import { TowerGame, WORLD_W, WORLD_H } from './engine';
import { unlock } from './audio';
import { t, LOCALE } from './i18n';
import { useGameScore, Leaderboard } from '@shared/leaderboard';
import { postAigramAPI, getGameUuid } from '@shared/runtime';
import './Game.less';

const BEST_KEY = 'baggage_check_best';
const POSTER_URL = 'https://yinxinghuan.github.io/games/posters/baggage-check.png';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<TowerGame | null>(null);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10));
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { isInAigram, canRank, submitScore, fetchLeaderboard, telegramId } = useGameScore();

  // snapshot of my own record on the wall at the moment this run started — used
  // to find exactly which rival I passed so I can notify them on game over.
  const preRunBest = useRef(0);

  const snapshotRecord = () => {
    if (!canRank || !telegramId) return;
    fetchLeaderboard()
      .then(rows => {
        const me = rows.find(r => String(r.user_id) === String(telegramId));
        preRunBest.current = me ? me.score : 0;
      })
      .catch(() => { /* leave previous snapshot */ });
  };

  // On game over: I just beat the rival whose old score sits in
  // (preRunBest, myScore]. Push them a 1:1 rivalry notify. Self-guarded, silent.
  const trySendBeatNotify = (myScore: number) => {
    if (!canRank || !telegramId || myScore <= preRunBest.current) return;
    fetchLeaderboard()
      .then(rows => {
        const meId = String(telegramId);
        const beaten = rows
          .filter(r => String(r.user_id) !== meId)
          .filter(r => r.score < myScore && r.score > preRunBest.current)
          .sort((a, b) => b.score - a.score)[0];
        if (!beaten) return;
        const msg = LOCALE === 'zh'
          ? `{sender_name} 摞了 ${myScore} 件行李，超过你了 — 看看你的感情能不能扛住。`
          : `{sender_name} stacked ${myScore} bags of baggage and passed you on Baggage Check.`;
        postAigramAPI('/note/aigram/ai/game/record/play', {
          session_id: getGameUuid(),
          event: 'score_beat',
          config_json: {
            actions: [{
              type: 'notify',
              target_user_id: String(beaten.user_id),
              image: {
                ref_url: POSTER_URL,
                prompt: 'A teetering tower of colorful hard-shell suitcases balanced on a candlelit dinner table, dim romantic restaurant, playful 3D illustration.',
              },
              message: { template: msg, variables: ['sender_name'] },
            }],
          },
        });
      })
      .catch(() => { /* silent */ });
  };

  const makeGame = (canvas: HTMLCanvasElement) => new TowerGame(canvas, {
    onScore: setScore,
    onGameOver: () => setOver(true),
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const game = makeGame(canvas);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as any).__bag = () => gameRef.current;
    const onResize = () => game.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); game.destroy(); };
  }, []);

  // submit final score + notify the rival I passed, once per game over
  useEffect(() => {
    if (over && score > 0) {
      submitScore(score).catch(() => { /* silent */ });
      trySendBeatNotify(score);
    }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  // persist best
  useEffect(() => {
    setBest(b => {
      if (score > b) { localStorage.setItem(BEST_KEY, String(score)); return score; }
      return b;
    });
  }, [score]);

  const onDown = () => {
    if (over) return;
    const g = gameRef.current!;
    if (!started) { unlock(); g.start(); setStarted(true); snapshotRecord(); return; }
    g.drop();
  };

  const restart = () => {
    gameRef.current?.destroy();
    const game = makeGame(canvasRef.current!);
    gameRef.current = game;
    setScore(0); setOver(false); setStarted(true);
    unlock(); game.start();
    snapshotRecord();
  };

  return (
    <div className="bag">
      <div className="bag__hud">
        <div className="bag__panel">
          <span className="bag__plabel">{t('stacked')}</span>
          <span className="bag__num">{score}</span>
        </div>
        <div className="bag__panel bag__panel--hi">
          <span className="bag__plabel">{t('best')}</span>
          <span className="bag__num">{best}</span>
        </div>
        {canRank && !over && (
          <button className="bag__lb-mini" onPointerDown={(e) => { e.stopPropagation(); setShowLeaderboard(true); }}>
            {t('leaderboard')}
          </button>
        )}
      </div>

      <div className="bag__stage">
        <canvas
          ref={canvasRef}
          className="bag__canvas"
          style={{ aspectRatio: `${WORLD_W} / ${WORLD_H}` }}
          onPointerDown={onDown}
        />

        {!started && (
          <div className="bag__hint">
            <div className="bag__hint-title">{t('title')}</div>
            <div className="bag__hint-sub">{t('tagline')}</div>
            <div className="bag__hint-cta">
              <svg className="bag__finger" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6C13 10.67 12.33 10 11.5 10S10 10.67 10 11.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.92-1.4z"/>
              </svg>
              <span>{t('hint')}</span>
            </div>
          </div>
        )}

        {over && (
          <div className="bag__over" onPointerDown={(e) => e.stopPropagation()}>
            <div className="bag__over-card">
              <div className="bag__over-title">{t('gameover')}</div>
              <div className="bag__over-sub">{t('goSub')}</div>
              <div className="bag__over-score">{score}</div>
              <div className="bag__over-best">{t('best')} {best}</div>
              <button className="bag__retry" onPointerDown={restart}>{t('retry')}</button>
              {canRank && (
                <button className="bag__lb-btn" onPointerDown={() => setShowLeaderboard(true)}>{t('leaderboard')}</button>
              )}
            </div>
          </div>
        )}

        {showLeaderboard && (
          <Leaderboard
            gameName={t('title')}
            isInAigram={isInAigram}
            onClose={() => setShowLeaderboard(false)}
            fetch={fetchLeaderboard}
          />
        )}
      </div>
    </div>
  );
}
