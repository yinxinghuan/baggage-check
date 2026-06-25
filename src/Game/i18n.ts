type Locale = 'zh' | 'en';

function detectLocale(): Locale {
  const o = localStorage.getItem('game_locale');
  if (o === 'en' || o === 'zh') return o;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const STR = {
  title:     { zh: '查验行李',          en: 'Baggage Check' },
  tagline:   { zh: '一场约会的承重测试',  en: 'a dating load test' },
  hint:      { zh: '点一下卸下行李，摞稳别让感情崩', en: "tap to drop the baggage — stack it, don't let it topple" },
  stacked:   { zh: '摞住',              en: 'STACKED' },
  best:      { zh: '最高',              en: 'BEST' },
  gameover:  { zh: '崩了',              en: 'IT COLLAPSED' },
  goSub:     { zh: '这段感情没撑住',      en: "the relationship couldn't take it" },
  retry:     { zh: '再约一次',          en: 'TRY AGAIN' },
  leaderboard: { zh: '排行榜',          en: 'LEADERBOARD' },
} as const;

const locale = detectLocale();

export function t(key: keyof typeof STR): string {
  return STR[key][locale];
}

export function loc(zh: string, en: string): string {
  return locale === 'zh' ? zh : en;
}

export const LOCALE = locale;
