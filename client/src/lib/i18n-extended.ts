/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother 
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา) 
 * URL:https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 * 
 * Extended i18n System - 40+ Languages Support
 * ASEAN + Other + All Indian Languages
 */

export const LANGUAGES_EXTENDED = {
  // ASEAN Languages
  th: { name: 'ไทย', nativeName: 'ไทย', region: 'ASEAN' },
  lo: { name: 'Lao', nativeName: 'ລາວ', region: 'ASEAN' },
  my: { name: 'Burmese', nativeName: 'မြန်မာ', region: 'ASEAN' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'ASEAN' },
  km: { name: 'Khmer', nativeName: 'ខ្មែរ', region: 'ASEAN' },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu', region: 'ASEAN' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'ASEAN' },
  fil: { name: 'Filipino', nativeName: 'Filipino', region: 'ASEAN' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', region: 'ASEAN/India' },

  // Other Languages
  ru: { name: 'Russian', nativeName: 'Русский', region: 'Other' },
  mn: { name: 'Mongolian', nativeName: 'Монгол', region: 'Other' },
  si: { name: 'Sinhala', nativeName: 'සිංහල', region: 'Other' },
  dz: { name: 'Dzongkha', nativeName: 'རྫོང་ཁ', region: 'Other' },
  ne: { name: 'Nepali', nativeName: 'नेपाली', region: 'Other' },

  // Indian Languages (21 languages)
  hi: { name: 'Hindi', nativeName: 'हिन्दी', region: 'India' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', region: 'India' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', region: 'India' },
  mr: { name: 'Marathi', nativeName: 'मराठी', region: 'India' },
  ur: { name: 'Urdu', nativeName: 'اردو', region: 'India' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'India' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'India' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', region: 'India' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'India' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'India' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া', region: 'India' },
  mai: { name: 'Maithili', nativeName: 'मैथिली', region: 'India' },
  sat: { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'India' },
  ks: { name: 'Kashmiri', nativeName: 'کٲشُر', region: 'India' },
  sd: { name: 'Sindhi', nativeName: 'سنڌي', region: 'India' },
  doi: { name: 'Dogri', nativeName: 'डोगरी', region: 'India' },
  mni: { name: 'Manipuri', nativeName: 'ମଣିପୁରୀ', region: 'India' },
  brx: { name: 'Bodo', nativeName: 'बड़ो', region: 'India' },
  kok: { name: 'Konkani', nativeName: 'कोंकणी', region: 'India' },

  // Original Languages (from previous)
  en: { name: 'English', nativeName: 'English', region: 'Global' },
  zh: { name: 'Chinese (Simplified)', nativeName: '中文', region: 'Asia' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '中文繁體', region: 'Asia' },
  ja: { name: 'Japanese', nativeName: '日本語', region: 'Asia' },
  ko: { name: 'Korean', nativeName: '한국어', region: 'Asia' },
  es: { name: 'Spanish', nativeName: 'Español', region: 'Europe' },
  fr: { name: 'French', nativeName: 'Français', region: 'Europe' },
  de: { name: 'German', nativeName: 'Deutsch', region: 'Europe' },
  pt: { name: 'Portuguese', nativeName: 'Português', region: 'Europe' },
  ar: { name: 'Arabic', nativeName: 'العربية', region: 'Middle East' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', region: 'Europe/Asia' },
  it: { name: 'Italian', nativeName: 'Italiano', region: 'Europe' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
  pl: { name: 'Polish', nativeName: 'Polski', region: 'Europe' },
  sv: { name: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', region: 'Europe' },
  cs: { name: 'Czech', nativeName: 'Čeština', region: 'Europe' },
  ro: { name: 'Romanian', nativeName: 'Română', region: 'Europe' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', region: 'Europe' },
  he: { name: 'Hebrew', nativeName: 'עברית', region: 'Middle East' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', region: 'Africa' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES_EXTENDED;

/**
 * Detect user's preferred language from browser
 */
export function detectLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language?.split('-')[0]?.toLowerCase() || 'en';
  
  // Check exact match
  if (browserLang in LANGUAGES_EXTENDED) {
    return browserLang as LanguageCode;
  }

  // Check region match
  const regionMap: Record<string, LanguageCode> = {
    th: 'th', lo: 'lo', my: 'my', vi: 'vi', km: 'km', ms: 'ms', id: 'id', fil: 'fil',
    ru: 'ru', mn: 'mn', si: 'si', dz: 'dz', ne: 'ne',
    hi: 'hi', bn: 'bn', te: 'te', mr: 'mr', ta: 'ta', ur: 'ur', gu: 'gu', kn: 'kn',
    ml: 'ml', or: 'or', pa: 'pa', as: 'as', mai: 'mai', sat: 'sat', ks: 'ks',
    sd: 'sd', doi: 'doi', mni: 'mni', brx: 'brx', kok: 'kok',
    en: 'en', zh: 'zh', ja: 'ja', ko: 'ko', es: 'es', fr: 'fr', de: 'de',
    pt: 'pt', ar: 'ar', tr: 'tr', it: 'it', nl: 'nl', pl: 'pl', sv: 'sv',
    uk: 'uk', cs: 'cs', ro: 'ro', el: 'el', he: 'he', sw: 'sw',
  };

  return regionMap[browserLang] || 'en';
}

/**
 * Get all available languages grouped by region
 */
export function getLanguagesByRegion() {
  const grouped: Record<string, Array<{ code: LanguageCode; name: string; nativeName: string }>> = {};

  Object.entries(LANGUAGES_EXTENDED).forEach(([code, lang]) => {
    const region = lang.region;
    if (!grouped[region]) {
      grouped[region] = [];
    }
    grouped[region].push({
      code: code as LanguageCode,
      name: lang.name,
      nativeName: lang.nativeName,
    });
  });

  return grouped;
}

/**
 * Get language name by code
 */
export function getLanguageName(code: LanguageCode): string {
  return LANGUAGES_EXTENDED[code]?.name || 'Unknown';
}

/**
 * Get native language name by code
 */
export function getNativeLanguageName(code: LanguageCode): string {
  return LANGUAGES_EXTENDED[code]?.nativeName || 'Unknown';
}

/**
 * Get all language codes
 */
export function getAllLanguageCodes(): LanguageCode[] {
  return Object.keys(LANGUAGES_EXTENDED) as LanguageCode[];
}

/**
 * Get total number of supported languages
 */
export function getTotalLanguages(): number {
  return Object.keys(LANGUAGES_EXTENDED).length;
}

export default {
  LANGUAGES_EXTENDED,
  detectLanguage,
  getLanguagesByRegion,
  getLanguageName,
  getNativeLanguageName,
  getAllLanguageCodes,
  getTotalLanguages,
};
