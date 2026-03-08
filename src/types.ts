export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  height: string;
  complexion: string;
  languages: string;
  hobbies: string;
  contact: string;
  email: string;
  address: string;
  customFields: CustomField[];
}

export interface FamilyInfo {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  familyType: string; // Nuclear/Joint
  nativePlace: string;
  customFields: CustomField[];
}

export interface EducationInfo {
  highestQualification: string;
  college: string;
  school: string;
  additionalSkills: string;
  customFields: CustomField[];
}

export interface ProfessionalInfo {
  occupation: string;
  company: string;
  income: string;
  experience: string;
  customFields: CustomField[];
}

export interface PartnerPreferencesInfo {
  summary: string;
  customFields: CustomField[];
}

export interface CustomizationOptions {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  photoLayout?: 'grid' | 'slideshow';
  classicVariant?: 'centered' | 'photo-left' | 'photo-top';
  classicFrameStyle?:
    | 'royal'
    | 'minimal'
    | 'floral'
    | 'mandala'
    | 'premium-gold'
    | 'temple-classic'
    | 'modern-luxe'
    | 'royal-maroon'
    | 'ivory-floral'
    | 'navy-heritage'
    | 'pastel-wedding'
    | 'traditional-scroll'
    | 'emerald-regal'
    | 'mono-executive'
    | 'saffron-sacred'
    | 'ruby-classic'
    | 'pearl-elegance'
    | 'charcoal-modern'
    | 'lotus-heritage';
  classicHeaderText?: string;
  classicHeaderIcon?: string;
  classicHeaderPosition?: { x: number; y: number };
  classicPhotoPosition?: { x: number; y: number };
  classicPersonalPhotoShape?: 'square' | 'rectangle';
  godLogo: string;
  selectedGodLogos?: string[];
  godLogoPosition?: { x: number; y: number };
  godLogoPositions?: Record<string, { x: number; y: number }>;
  godLogoSize: number;
  godLogoOpacity?: number;
  sectionVisibility: {
    personal: boolean;
    family: boolean;
    education: boolean;
    professional: boolean;
    partnerPreferences: boolean;
  };
}

export interface Biodata {
  personal: PersonalInfo;
  family: FamilyInfo;
  education: EducationInfo;
  professional: ProfessionalInfo;
  partnerPreferences: PartnerPreferencesInfo;
  templateId: string;
  country: string; // Country code
  language: string; // Target language for generation
  images: string[]; // Array of base64 image strings
  profileImage?: string; // Base64 string for profile picture
  profileImageCrop?: { x: number; y: number; width: number; height: number }; // Crop area
  customization: CustomizationOptions;
}

export const initialBiodata: Biodata = {
  personal: {
    fullName: "Aarav Sharma",
    dob: "1995-08-15",
    gender: "Male",
    maritalStatus: "Single",
    height: "5'11\"",
    complexion: "Fair",
    languages: "English, Hindi, Punjabi",
    hobbies: "Photography, Trekking, Reading",
    contact: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    address: "42, Green Park Extension, New Delhi, India",
    customFields: [],
  },
  family: {
    fatherName: "Rajesh Sharma",
    fatherOccupation: "Businessman (Textiles)",
    motherName: "Sunita Sharma",
    motherOccupation: "Homemaker",
    siblings: "1 Younger Sister (Studying)",
    familyType: "Nuclear",
    nativePlace: "Jaipur, Rajasthan",
    customFields: [],
  },
  education: {
    highestQualification: "MBA (Marketing)",
    college: "IIM Bangalore",
    school: "DPS RK Puram",
    additionalSkills: "Digital Marketing, Public Speaking",
    customFields: [],
  },
  professional: {
    occupation: "Senior Marketing Manager",
    company: "TechGlobal Solutions",
    income: "24 LPA",
    experience: "5 Years",
    customFields: [],
  },
  partnerPreferences: {
    summary: "Looking for a kind, educated, and family-oriented partner who values mutual respect and open communication. Preference for someone with a balanced approach to career and family life. Compatibility in values, lifestyle, and long-term goals is important.",
    customFields: [],
  },
  templateId: "classic",
  country: "IN",
  language: "English",
  images: [],
  profileImage: undefined,
  profileImageCrop: undefined,
  customization: {
    primaryColor: "#92400e", // amber-800 default for classic
    backgroundColor: "#ffffff",
    fontFamily: "serif",
    classicVariant: 'centered',
    classicFrameStyle: 'royal',
    classicHeaderText: 'ॐ श्री गणेशाय नमः',
    classicHeaderIcon: 'ganesha-4',
    classicHeaderPosition: undefined,
    classicPhotoPosition: undefined,
    classicPersonalPhotoShape: 'rectangle',
    photoLayout: 'grid',
    godLogo: 'None',
    selectedGodLogos: [],
    godLogoPosition: undefined,
    godLogoPositions: {},
    godLogoSize: 24,
    godLogoOpacity: 0.75,
    sectionVisibility: {
      personal: true,
      family: true,
      education: true,
      professional: true,
      partnerPreferences: true,
    },
  },
};
