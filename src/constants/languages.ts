export interface Country {
  code: string;
  name: string;
  languages: Language[];
}

export interface Language {
  code: string;
  name: string;
}

export const countries: Country[] = [
  {
    code: 'IN',
    name: 'India',
    languages: [
      { code: 'hi', name: 'Hindi' },
      { code: 'bn', name: 'Bengali' },
      { code: 'te', name: 'Telugu' },
      { code: 'mr', name: 'Marathi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'ur', name: 'Urdu' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'en', name: 'English' },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ],
  },
  {
    code: 'ES',
    name: 'Spain',
    languages: [
      { code: 'es', name: 'Spanish' },
      { code: 'ca', name: 'Catalan' },
      { code: 'gl', name: 'Galician' },
      { code: 'eu', name: 'Basque' },
    ],
  },
  {
    code: 'FR',
    name: 'France',
    languages: [
      { code: 'fr', name: 'French' },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    languages: [
      { code: 'de', name: 'German' },
    ],
  },
  {
    code: 'CN',
    name: 'China',
    languages: [
      { code: 'zh', name: 'Mandarin' },
    ],
  },
  {
    code: 'AE',
    name: 'UAE',
    languages: [
      { code: 'ar', name: 'Arabic' },
      { code: 'en', name: 'English' },
    ],
  },
];
