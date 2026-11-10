import type { Bi } from '../data/courses'
import { useApp } from '../store/useApp'

export function useT() {
  const lang = useApp((s) => s.lang)
  return (b: Bi) => b[lang]
}

export const UI = {
  tagline: {
    gu: 'શૂન્યથી CCNP સુધી — એનિમેશન સાથે, એકદમ સહેલાઈથી',
    en: 'From zero to CCNP — with animation, made genuinely easy',
  },
  heroTitle: { gu: 'નેટવર્કિંગ, આંખે જોઈને શીખો', en: 'Learn networking by watching it happen' },
  heroBody: {
    gu: 'દરેક વિષય ત્રણ તબક્કામાં: પહેલાં એનિમેશનમાં જુઓ, પછી જાતે configure કરો, અને પછી તોડીને જુઓ કે શું થાય છે. તમારી કમાન્ડ જ એનિમેશનને આગળ ચલાવે છે.',
    en: 'Every topic in three stages: watch it animate, configure it yourself, then break it and see what happens. Your commands are what drive the animation forward.',
  },
  startCourse: { gu: 'કોર્સ શરૂ કરો', en: 'Start course' },
  continue: { gu: 'આગળ ચાલુ રાખો', en: 'Continue' },
  lessons: { gu: 'પાઠ', en: 'lessons' },
  modules: { gu: 'વિભાગ', en: 'modules' },
  hours: { gu: 'કલાક', en: 'hours' },
  prereq: { gu: 'પૂર્વશરત', en: 'Prerequisite' },
  done: { gu: 'પૂરું', en: 'done' },
  stageLearn: { gu: 'સમજો', en: 'Learn' },
  stageConfig: { gu: 'બનાવો', en: 'Configure' },
  stageBreak: { gu: 'તોડો', en: 'Break it' },
  comingSoon: { gu: 'ટૂંક સમયમાં', en: 'Coming soon' },
  comingSoonBody: {
    gu: 'આ પાઠ હજી બની રહ્યો છે. કોર્સનું માળખું તૈયાર છે — પાઠ એક પછી એક ઉમેરાતા જશે.',
    en: 'This lesson is still being built. The course structure is in place and lessons are being added one by one.',
  },
  markDone: { gu: 'પૂરું થયું', en: 'Mark as done' },
  markedDone: { gu: 'પૂરું થયેલું', en: 'Completed' },
  nextLesson: { gu: 'આગળનો પાઠ', en: 'Next lesson' },
  prevLesson: { gu: 'પાછલો પાઠ', en: 'Previous' },
  backToCourse: { gu: 'કોર્સમાં પાછા', en: 'Back to course' },
  modeBeginner: { gu: 'Beginner', en: 'Beginner' },
  modeExam: { gu: 'Exam', en: 'Exam' },
  modeHint: {
    gu: 'ભાષા સહેલી કે exam જેવી — તમે પસંદ કરો',
    en: 'Plain language or exam language — your choice',
  },
  progress: { gu: 'પ્રગતિ', en: 'Progress' },
  play: { gu: 'ચલાવો', en: 'Play' },
  pause: { gu: 'થોભો', en: 'Pause' },
  replay: { gu: 'ફરી', en: 'Replay' },
  step: { gu: 'પગલું', en: 'STEP' },
  whyTitle: { gu: 'આ કેમ શીખવું?', en: 'Why learn this?' },
  keyTakeaway: { gu: 'યાદ રાખવા જેવું', en: 'Key takeaway' },
  checkTitle: { gu: 'તપાસો', en: 'Quick check' },
  correct: { gu: 'સાચું!', en: 'Correct!' },
  tryAgain: { gu: 'ફરી વિચારો', en: 'Think again' },
} as const
