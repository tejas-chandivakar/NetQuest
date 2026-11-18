import type { Bi } from '../data/courses'
import { useApp } from '../store/useApp'

export function useT() {
  const lang = useApp((s) => s.lang)
  // Hindi is being rolled out file-by-file; fall back to Gujarati, then
  // English, so a string without a `hi` value still reads naturally.
  return (b: Bi) => (lang === 'hi' ? (b.hi ?? b.gu ?? b.en) : b[lang])
}

export const UI = {
  tagline: {
    gu: 'શૂન્યથી CCNP સુધી — એનિમેશન સાથે, એકદમ સહેલાઈથી',
    hi: 'शून्य से CCNP तक — एनिमेशन के साथ, बिल्कुल आसानी से',
    en: 'From zero to CCNP — with animation, made genuinely easy',
  },
  heroTitle: {
    gu: 'નેટવર્કિંગ, આંખે જોઈને શીખો',
    hi: 'नेटवर्किंग, आंखों से देखकर सीखें',
    en: 'Learn networking by watching it happen',
  },
  heroBody: {
    gu: 'દરેક વિષય ત્રણ તબક્કામાં: પહેલાં એનિમેશનમાં જુઓ, પછી જાતે configure કરો, અને પછી તોડીને જુઓ કે શું થાય છે. તમારી કમાન્ડ જ એનિમેશનને આગળ ચલાવે છે.',
    hi: 'हर विषय तीन चरणों में: पहले एनिमेशन में देखें, फिर खुद configure करें, और फिर तोड़कर देखें कि क्या होता है। आपकी command ही एनिमेशन को आगे चलाती है।',
    en: 'Every topic in three stages: watch it animate, configure it yourself, then break it and see what happens. Your commands are what drive the animation forward.',
  },
  startCourse: { gu: 'કોર્સ શરૂ કરો', hi: 'कोर्स शुरू करें', en: 'Start course' },
  continue: { gu: 'આગળ ચાલુ રાખો', hi: 'आगे जारी रखें', en: 'Continue' },
  lessons: { gu: 'પાઠ', hi: 'पाठ', en: 'lessons' },
  modules: { gu: 'વિભાગ', hi: 'विभाग', en: 'modules' },
  hours: { gu: 'કલાક', hi: 'घंटे', en: 'hours' },
  prereq: { gu: 'પૂર્વશરત', hi: 'पूर्वशर्त', en: 'Prerequisite' },
  done: { gu: 'પૂરું', hi: 'पूरा', en: 'done' },
  stageLearn: { gu: 'સમજો', hi: 'समझें', en: 'Learn' },
  stageConfig: { gu: 'બનાવો', hi: 'बनाएं', en: 'Configure' },
  /* Foundation promises no CLI, so its hands-on stage is not called Configure */
  stageTry: { gu: 'જાતે કરો', hi: 'खुद करें', en: 'Try it' },
  stageBreak: { gu: 'તોડો', hi: 'तोड़ें', en: 'Break it' },
  stageBuild: { gu: 'જાતે બનાવો', hi: 'खुद बनाएं', en: 'Build it' },
  comingSoon: { gu: 'ટૂંક સમયમાં', hi: 'जल्द ही', en: 'Coming soon' },
  comingSoonBody: {
    gu: 'આ પાઠ હજી બની રહ્યો છે. કોર્સનું માળખું તૈયાર છે — પાઠ એક પછી એક ઉમેરાતા જશે.',
    hi: 'यह पाठ अभी बन रहा है। कोर्स का ढांचा तैयार है — पाठ एक के बाद एक जोड़े जाते जाएंगे।',
    en: 'This lesson is still being built. The course structure is in place and lessons are being added one by one.',
  },
  markDone: { gu: 'પૂરું થયું', hi: 'पूरा हुआ', en: 'Mark as done' },
  markedDone: { gu: 'પૂરું થયેલું', hi: 'पूरा हो चुका', en: 'Completed' },
  nextLesson: { gu: 'આગળનો પાઠ', hi: 'अगला पाठ', en: 'Next lesson' },
  prevLesson: { gu: 'પાછલો પાઠ', hi: 'पिछला पाठ', en: 'Previous' },
  backToCourse: { gu: 'કોર્સમાં પાછા', hi: 'कोर्स में वापस', en: 'Back to course' },
  modeBeginner: { gu: 'Beginner', hi: 'Beginner', en: 'Beginner' },
  modeExam: { gu: 'Exam', hi: 'Exam', en: 'Exam' },
  modeHint: {
    gu: 'ભાષા સહેલી કે exam જેવી — તમે પસંદ કરો',
    hi: 'भाषा आसान या exam जैसी — आप चुनें',
    en: 'Plain language or exam language — your choice',
  },
  progress: { gu: 'પ્રગતિ', hi: 'प्रगति', en: 'Progress' },
  play: { gu: 'ચલાવો', hi: 'चलाएं', en: 'Play' },
  pause: { gu: 'થોભો', hi: 'रोकें', en: 'Pause' },
  replay: { gu: 'ફરી', hi: 'फिर से', en: 'Replay' },
  step: { gu: 'પગલું', hi: 'चरण', en: 'STEP' },
  whyTitle: { gu: 'આ કેમ શીખવું?', hi: 'यह क्यों सीखें?', en: 'Why learn this?' },
  keyTakeaway: { gu: 'યાદ રાખવા જેવું', hi: 'याद रखने योग्य', en: 'Key takeaway' },
  checkTitle: { gu: 'તપાસો', hi: 'जांचें', en: 'Quick check' },
  correct: { gu: 'સાચું!', hi: 'सही!', en: 'Correct!' },
  tryAgain: { gu: 'ફરી વિચારો', hi: 'फिर से सोचें', en: 'Think again' },
} as const
