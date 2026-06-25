// The "baggage" you stack in Baggage Check.
// Each is one piece of emotional baggage your date drops on the pile — a
// suitcase you balance on a wobbling tower and try not to topple (= the
// relationship collapses). Labels are short so they fit on a suitcase.

export interface Stressor {
  zh: string;
  en: string;
  color: string;   // suitcase shell color (dark ink text on top)
}

export const STRESSORS: Stressor[] = [
  { zh: '妈宝',       en: 'mommy issues',   color: '#e7a13d' },
  { zh: '还和前任聊', en: 'texts the ex',   color: '#5ac3c7' },
  { zh: '情感隔离',   en: 'avoidant',       color: '#ff8a8a' },
  { zh: '三猫一房贷', en: '3 cats, 1 lease',color: '#c39bff' },
  { zh: '信任问题',   en: 'trust issues',   color: '#7fb1ff' },
  { zh: '我的心理医生',en: 'my therapist',  color: '#f29ac1' },
  { zh: '住我妈家',   en: 'lives with mom', color: '#f0c64a' },
  { zh: '暧昧不清',   en: 'situationship',  color: '#6fd0a0' },
  { zh: '满身红旗',   en: 'red flags',      color: '#ff6f6f' },
  { zh: '突然消失',   en: 'ghosted me',     color: '#9aa0b8' },
  { zh: '吊着我',     en: 'breadcrumbs',    color: '#f0a76b' },
  { zh: '健身没工作', en: 'gym, no job',    color: '#cf9be0' },
  { zh: '币圈兄弟',   en: 'crypto bro',     color: '#e6c25a' },
  { zh: '爱情轰炸',   en: 'love bombing',   color: '#ff9bb0' },
  { zh: '被抛弃感',   en: 'abandonment',    color: '#8fb0d8' },
  { zh: '还在用 Hinge',en: 'still on Hinge',color: '#74cdb0' },
  { zh: '47 条未读',  en: 'unread: 47',     color: '#d9a36a' },
  { zh: '没爱好',     en: 'no hobbies',     color: '#b8bccb' },
  { zh: '一身的刺',   en: 'the ick',        color: '#ff7d9a' },
  { zh: '我能改造他', en: 'fixer-upper',    color: '#86c98e' },
];

let lastIdx = -1;
export function pickStressor(): Stressor {
  let i = Math.floor(Math.random() * STRESSORS.length);
  if (i === lastIdx) i = (i + 1) % STRESSORS.length;  // avoid two of the same in a row
  lastIdx = i;
  return STRESSORS[i];
}
