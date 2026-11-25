import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* Interface strings in English and Malayalam. Missing Malayalam keys fall back to English. */
const STRINGS = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.library': 'Documents',
    'nav.ask': 'Ask AI',
    'nav.search': 'Search',
    'nav.calendar': 'Calendar',
    'nav.graph': 'Knowledge Graph',
    'nav.history': 'History',
    'nav.settings': 'Profile & Settings',
    'status.online': 'API Connected',
    'status.offline': 'API Offline',
    'status.demo': 'Demo Mode',
    'auth.signin': 'Sign in',
    'auth.signout': 'Sign out',
    'auth.register': 'Create account',

    'landing.title': 'Document intelligence, in your language.',
    'landing.lede':
      'Upload circulars, contracts, and scanned notices in English or Malayalam. DocuHub extracts deadlines, maps connections across files, and delivers cited answers with a transparent execution trace.',
    'landing.open': 'Open Workspace',
    'landing.demo': 'Explore Demo Workspace',
    'landing.problem': 'Stop hunting through PDFs for a single deadline',
    'landing.problemBody':
      'Critical due dates hide in paragraph four of a circular. The same vendor appears across three unlinked agreements. Notices arrive in Malayalam while search only indexes English. DocuHub reads every document, connects the dots, and shows its sources.',
    'landing.how': 'How DocuHub processes every file',
    'landing.does': 'Core capabilities',

    'dash.greeting.morning': 'Good morning',
    'dash.greeting.afternoon': 'Good afternoon',
    'dash.greeting.evening': 'Good evening',
    'dash.sub': 'Document intelligence overview, upcoming deadlines, and quick AI access.',
    'dash.documents': 'Documents',
    'dash.processed': 'processed',
    'dash.deadlines': 'Upcoming deadlines',
    'dash.urgent': 'high urgency',
    'dash.connections': 'Graph links',
    'dash.connectionsSub': 'related document pairs',
    'dash.questions': 'Queries answered',
    'dash.questionsSub': 'with source citations',
    'dash.recent': 'Recent documents',
    'dash.coming': 'Upcoming schedule',
    'dash.ask': 'Ask DocuHub AI',
    'dash.askPh': 'e.g. When is the last date to submit utilisation certificates?',
    'dash.system': 'Platform & Pipeline Status',

    'ask.scope': 'Document Scope',
    'ask.all': 'All ready documents',
    'ask.answerIn': 'Response language',
    'ask.auto': 'Auto',
    'ask.question': 'Ask a question',
    'ask.placeholder': 'Ask about deadlines, clauses, or notices in English or Malayalam…',
    'ask.run': 'Ask AI',
    'ask.running': 'Analysing…',
    'ask.try': 'Suggested questions',
    'ask.answer': 'Answer',
    'ask.confidence': 'Confidence',
    'ask.sources': 'Cited Sources',
    'ask.how': 'Execution Trace',
    'ask.howEmpty':
      'Every step — language detection, translation, retrieval, answer generation, and grounding check — appears here with step timings.',
    'ask.copy': 'Copy answer',
    'ask.trace': 'Export trace (JSON)',
    'ask.another': 'New question',
    'ask.lowConf': 'Low confidence match',
    'ask.lowConfBody':
      'The retrieved passages only partially match your question. Review the cited sources before acting on this summary.',
    'ask.readAs': 'Language flow',
    'ask.engine': 'Engine',

    'lib.title': 'Document Library',
    'lib.sub': 'Upload, inspect, tag, and manage documents processed by DocuHub.',
    'lib.drop': 'Drag and drop files here, or',
    'lib.browse': 'browse computer',
    'lib.hint': 'PDF, DOCX, TXT, PNG or JPG · up to 50 MB · English or Malayalam',

    'search.title': 'Semantic & Tag Search',
    'search.ph': 'Search by meaning, keyword, or department…',
    'search.tags': 'Filter by tag',
    'cal.title': 'Deadlines & Calendar',
    'cal.sub': 'Dates, meetings, payments, and expiries automatically extracted from your documents.',
    'graph.title': 'Knowledge Graph',
    'graph.sub': 'Explore semantic links and shared entities connecting your document collection.',
    'history.title': 'Query History',
    'history.sub': 'Audit past questions, cited answers, and full execution traces.',
    'settings.title': 'Profile & Settings',
    'settings.sub': 'Manage your DocuHub account details, language preferences, and backend status.',
  },
  ml: {
    'nav.dashboard': 'ഡാഷ്ബോർഡ്',
    'nav.library': 'രേഖകൾ',
    'nav.ask': 'AI ചോദിക്കുക',
    'nav.search': 'തിരയുക',
    'nav.calendar': 'കലണ്ടർ',
    'nav.graph': 'നോളജ് ഗ്രാഫ്',
    'nav.history': 'ചരിത്രം',
    'nav.settings': 'പ്രൊഫൈലും ക്രമീകരണങ്ങളും',
    'status.online': 'API ഓൺലൈൻ',
    'status.offline': 'API ഓഫ്‌ലൈൻ',
    'status.demo': 'ഡെമോ മോഡ്',
    'auth.signin': 'ലോഗിൻ',
    'auth.signout': 'ലോഗ് ഔട്ട്',
    'auth.register': 'അക്കൗണ്ട് സൃഷ്ടിക്കുക',

    'landing.title': 'നിങ്ങളുടെ രേഖകളോട്, നിങ്ങളുടെ ഭാഷയിൽ ചോദിക്കൂ.',
    'landing.lede':
      'ഇംഗ്ലീഷിലോ മലയാളത്തിലോ ഉള്ള സർക്കുലറുകൾ, കരാറുകൾ, സ്കാൻ ചെയ്ത നോട്ടീസുകൾ അപ്‌ലോഡ് ചെയ്യുക. ഡോക്യുഹബ് (DocuHub) അവ വായിച്ച്, സമയപരിധികൾ കണ്ടെത്തി, ബന്ധപ്പെട്ട ഫയലുകൾ ബന്ധിപ്പിച്ച്, ഉറവിടം സഹിതം ഉത്തരം നൽകുന്നു.',
    'landing.open': 'വർക്ക്‌സ്‌പേസ് തുറക്കുക',
    'landing.demo': 'ഡെമോ അക്കൗണ്ട് പരീക്ഷിക്കുക',
    'landing.problem': 'ഒരു തീയതി കണ്ടെത്താൻ എല്ലാ ഫയലുകളും വായിക്കേണ്ടതില്ല',
    'landing.problemBody':
      'പ്രധാന സമയപരിധികൾ സർക്കുലറുകളുടെ ഉള്ളിൽ മറഞ്ഞിരിക്കുന്നു. ബന്ധപ്പെട്ട രേഖകൾ തമ്മിൽ ലിങ്ക് ചെയ്യപ്പെടാതെ കിടക്കുന്നു. മലയാളം നോട്ടീസുകൾ തിരയാൻ ബുദ്ധിമുട്ടാകുന്നു. ഡോക്യുഹബ് ഇവയെല്ലാം വേഗത്തിൽ വിശകലനം ചെയ്യുന്നു.',
    'landing.how': 'അപ്‌ലോഡ് ചെയ്യുമ്പോൾ എന്ത് സംഭവിക്കുന്നു',
    'landing.does': 'പ്രധാന സവിശേഷതകൾ',

    'dash.greeting.morning': 'സുപ്രഭാതം',
    'dash.greeting.afternoon': 'നമസ്കാരം',
    'dash.greeting.evening': 'ശുഭസായാഹ്നം',
    'dash.sub': 'നിങ്ങളുടെ രേഖകളുടെ സംഗ്രഹവും വരാനിരിക്കുന്ന സമയപരിധികളും.',
    'dash.documents': 'രേഖകൾ',
    'dash.processed': 'പ്രോസസ്സ് ചെയ്തു',
    'dash.deadlines': 'വരാനിരിക്കുന്ന സമയപരിധികൾ',
    'dash.urgent': 'അടിയന്തര ശ്രദ്ധ വേണ്ടവ',
    'dash.connections': 'ബന്ധങ്ങൾ',
    'dash.connectionsSub': 'ബന്ധപ്പെട്ട ഫയലുകൾ',
    'dash.questions': 'ചോദിച്ച ചോദ്യങ്ങൾ',
    'dash.questionsSub': 'ഉറവിടം സഹിതം',
    'dash.recent': 'സമീപകാല രേഖകൾ',
    'dash.coming': 'വരാനിരിക്കുന്നവ',
    'dash.ask': 'ഡോക്യുഹബ് AI-യോട് ചോദിക്കുക',
    'dash.askPh': 'ഉദാ: യൂട്ടിലൈസേഷൻ സർട്ടിഫിക്കറ്റ് സമർപ്പിക്കാനുള്ള അവസാന തീയതി എപ്പോഴാണ്?',
    'dash.system': 'സിസ്റ്റം നില',

    'ask.scope': 'പരിഗണിക്കുന്ന രേഖകൾ',
    'ask.all': 'എല്ലാ രേഖകളും',
    'ask.answerIn': 'ഉത്തരത്തിന്റെ ഭാഷ',
    'ask.auto': 'സ്വയം',
    'ask.question': 'നിങ്ങളുടെ ചോദ്യം',
    'ask.placeholder': 'ഇംഗ്ലീഷിലോ മലയാളത്തിലോ നിങ്ങളുടെ രേഖകളെക്കുറിച്ച് ചോദിക്കുക…',
    'ask.run': 'ചോദിക്കുക',
    'ask.running': 'വിശകലനം ചെയ്യുന്നു…',
    'ask.try': 'ഇവയിലൊന്ന് പരീക്ഷിക്കുക',
    'ask.answer': 'ഉത്തരം',
    'ask.confidence': 'വിശ്വാസ്യത',
    'ask.sources': 'ഉറവിടങ്ങൾ',
    'ask.how': 'നടപടിക്രമം (Trace)',
    'ask.howEmpty':
      'ഭാഷ തിരിച്ചറിയൽ, തിരച്ചിൽ, ഉത്തരം തയ്യാറാക്കൽ, പരിശോധന — ഓരോ ഘട്ടവും സമയം സഹിതം ഇവിടെ കാണാം.',
    'ask.copy': 'ഉത്തരം പകർത്തുക',
    'ask.trace': 'ട്രേസ് ഡൗൺലോഡ് (JSON)',
    'ask.another': 'പുതിയ ചോദ്യം',
    'ask.lowConf': 'കുറഞ്ഞ വിശ്വാസ്യത',
    'ask.lowConfBody':
      'കണ്ടെത്തിയ ഭാഗങ്ങൾ ചോദ്യവുമായി ഭാഗികമായി മാത്രമേ യോജിക്കുന്നുള്ളൂ. ആശ്രയിക്കുന്നതിന് മുമ്പ് ഉറവിടങ്ങൾ പരിശോധിക്കുക.',
    'ask.readAs': 'ഭാഷാ ക്രമം',
    'ask.engine': 'എഞ്ചിൻ',

    'lib.title': 'രേഖകളുടെ ശേഖരം',
    'lib.sub': 'നിങ്ങൾ അപ്‌ലോഡ് ചെയ്യുന്ന ഓരോ ഫയലും വായിച്ച്, ടാഗ് ചെയ്ത്, മറ്റുള്ളവയുമായി ബന്ധിപ്പിക്കുന്നു.',
    'lib.drop': 'ഫയലുകൾ ഇവിടെ ഇടുക, അല്ലെങ്കിൽ',
    'lib.browse': 'ഫയലുകൾ തിരഞ്ഞെടുക്കുക',
    'lib.hint': 'PDF, DOCX, TXT, PNG, JPG · 50 MB വരെ · ഇംഗ്ലീഷ് അല്ലെങ്കിൽ മലയാളം',

    'search.title': 'സെമാന്റിക് തിരച്ചിൽ',
    'search.ph': 'അർത്ഥം, വാക്ക് അല്ലെങ്കിൽ ടാഗ് ഉപയോഗിച്ച് തിരയുക…',
    'search.tags': 'ടാഗ് ഉപയോഗിച്ച് ചുരുക്കുക',
    'cal.title': 'കലണ്ടറും സമയപരിധികളും',
    'cal.sub': 'നിങ്ങളുടെ രേഖകൾക്കുള്ളിൽ കണ്ടെത്തിയ തീയതികളും സമയപരിധികളും.',
    'graph.title': 'നോളജ് ഗ്രാഫ്',
    'graph.sub': 'ഒരേ കാര്യങ്ങളെക്കുറിച്ച് പറയുന്ന രേഖകൾ ബന്ധിപ്പിച്ചിരിക്കുന്നു.',
    'history.title': 'ചോദ്യ ചരിത്രം',
    'history.sub': 'ചോദിച്ച ഓരോ ചോദ്യവും, അതിന്റെ ഉത്തരവും അത് തയ്യാറാക്കിയ വിധവും.',
    'settings.title': 'പ്രൊഫൈലും ക്രമീകരണങ്ങളും',
    'settings.sub': 'അക്കൗണ്ട് വിവരങ്ങളും ഭാഷാ ക്രമീകരണങ്ങളും.',
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

function initialLang() {
  try {
    return localStorage.getItem('docuhub.lang') === 'ml' ? 'ml' : 'en';
  } catch {
    return 'en';
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try {
      localStorage.setItem('docuhub.lang', l);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
