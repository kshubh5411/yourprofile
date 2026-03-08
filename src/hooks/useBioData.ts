import { useState, useEffect, useRef, useMemo } from 'react';
import { Biodata, initialBiodata } from '../types';
import { generatePartnerPreferences, translateAndEnhance } from '../services/ai';
import { translations, defaultLabels, TranslationLabels } from '../constants/translations';

function mergeSectionPreservingEdits<T extends Record<string, any>>(
  currentSection: T,
  snapshotSection: T,
  aiSection: T
): T {
  const mergedSection: Record<string, any> = { ...currentSection };

  for (const key of Object.keys(snapshotSection)) {
    if (key === 'customFields') continue;

    const currentValue = currentSection[key];
    const snapshotValue = snapshotSection[key];
    const aiValue = aiSection?.[key];

    mergedSection[key] = currentValue === snapshotValue ? aiValue ?? currentValue : currentValue;
  }

  const currentCustomFields = currentSection.customFields || [];
  const snapshotCustomFields = snapshotSection.customFields || [];
  const customFieldsUnchanged = JSON.stringify(currentCustomFields) === JSON.stringify(snapshotCustomFields);
  mergedSection.customFields = customFieldsUnchanged ? (aiSection?.customFields ?? currentCustomFields) : currentCustomFields;

  return mergedSection as T;
}

function mergeAiResponsePreservingEdits(current: Biodata, snapshot: Biodata, aiData: Biodata): Biodata {
  const mergedData: Biodata = {
    ...current,
    personal: mergeSectionPreservingEdits(current.personal, snapshot.personal, aiData.personal),
    family: mergeSectionPreservingEdits(current.family, snapshot.family, aiData.family),
    education: mergeSectionPreservingEdits(current.education, snapshot.education, aiData.education),
    professional: mergeSectionPreservingEdits(current.professional, snapshot.professional, aiData.professional),
    partnerPreferences: mergeSectionPreservingEdits(current.partnerPreferences, snapshot.partnerPreferences, aiData.partnerPreferences),
  };

  return mergedData;
}

export const useBioData = () => {
  const [data, setData] = useState<Biodata>(initialBiodata);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPartnerPreferences, setIsGeneratingPartnerPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labels = useMemo<TranslationLabels>(
    () => ({ ...defaultLabels, ...(translations[data.language] || {}) }),
    [data.language]
  );
  
  // Track previous language to avoid loops
  const prevLanguageRef = useRef(data.language);
  const latestAiRequestRef = useRef(0);

  // Auto-translate content when language changes
  useEffect(() => {
    const autoTranslate = async () => {
      // Only translate if language actually changed and isn't English (unless switching back to English)
      if (data.language !== prevLanguageRef.current) {
        prevLanguageRef.current = data.language;
        
        // Don't auto-translate empty data
        const hasData = data.personal.fullName || data.professional.occupation;
        if (hasData) {
          await handleAiEnhance();
        }
      }
    };
    
    autoTranslate();
  }, [data.language]);

  const updateField = (section: keyof Biodata, field: string, value: string) => {
    setData((prev) => {
      // Handle top-level string fields if any (though currently only templateId/language are top-level strings)
      if (typeof prev[section] === 'string') {
        return { ...prev, [section]: value };
      }
      
      // Handle nested object updates
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      };
    });
  };

  const updateCustomField = (section: keyof Biodata, id: string, field: 'label' | 'value', value: string) => {
    setData((prev) => {
      const sectionData = prev[section] as any;
      if (!sectionData.customFields) return prev;

      return {
        ...prev,
        [section]: {
          ...sectionData,
          customFields: sectionData.customFields.map((item: any) => 
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  };

  const addCustomField = (section: keyof Biodata) => {
    setData((prev) => {
      const sectionData = prev[section] as any;
      const newField = {
        id: crypto.randomUUID(),
        label: 'New Field',
        value: '',
      };
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          customFields: [...(sectionData.customFields || []), newField],
        },
      };
    });
  };

  const removeCustomField = (section: keyof Biodata, id: string) => {
    setData((prev) => {
      const sectionData = prev[section] as any;
      if (!sectionData.customFields) return prev;

      return {
        ...prev,
        [section]: {
          ...sectionData,
          customFields: sectionData.customFields.filter((item: any) => item.id !== id),
        },
      };
    });
  };

  const setTemplate = (templateId: string) => {
    setData((prev) => ({ ...prev, templateId }));
  };

  const setCountry = (country: string) => {
    setData((prev) => ({ ...prev, country }));
  };

  const setLanguage = (language: string) => {
    setData((prev) => ({ ...prev, language }));
  };

  const updateCustomization = (field: keyof Biodata['customization'], value: any) => {
    setData((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value,
      },
    }));
  };

  const toggleSectionVisibility = (section: keyof Biodata['customization']['sectionVisibility']) => {
    setData((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        sectionVisibility: {
          ...prev.customization.sectionVisibility,
          [section]: !prev.customization.sectionVisibility[section],
        },
      },
    }));
  };

  const addImage = (image: string) => {
    setData((prev) => ({
      ...prev,
      images: [...(prev.images || []), image],
    }));
  };

  const removeImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const updateProfileImage = (image: string | undefined, crop?: { x: number; y: number; width: number; height: number }) => {
    setData((prev) => ({
      ...prev,
      profileImage: image,
      profileImageCrop: crop,
    }));
  };

  const handleAiEnhance = async () => {
    const snapshot = data;
    const requestId = latestAiRequestRef.current + 1;
    latestAiRequestRef.current = requestId;
    setIsGenerating(true);
    setError(null);
    try {
      const enhancedData = await translateAndEnhance(snapshot, snapshot.language);
      setData((prev) => ({
        ...(requestId === latestAiRequestRef.current
          ? mergeAiResponsePreservingEdits(prev, snapshot, enhancedData)
          : prev),
      }));
    } catch (err) {
      if (requestId === latestAiRequestRef.current) {
        setError("Failed to enhance biodata. Please try again.");
      }
      console.error(err);
    } finally {
      if (requestId === latestAiRequestRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleGeneratePartnerPreferences = async () => {
    setIsGeneratingPartnerPreferences(true);
    setError(null);
    try {
      const summary = await generatePartnerPreferences(data);
      setData((prev) => ({
        ...prev,
        partnerPreferences: {
          ...prev.partnerPreferences,
          summary,
        },
      }));
    } catch (err) {
      setError("Failed to generate partner preferences. Please try again.");
      console.error(err);
    } finally {
      setIsGeneratingPartnerPreferences(false);
    }
  };

  const loadSampleData = () => {
    setData({
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
      },
      family: {
        fatherName: "Rajesh Sharma",
        fatherOccupation: "Businessman (Textiles)",
        motherName: "Sunita Sharma",
        motherOccupation: "Homemaker",
        siblings: "1 Younger Sister (Studying)",
        familyType: "Nuclear",
        nativePlace: "Jaipur, Rajasthan",
      },
      education: {
        highestQualification: "MBA (Marketing)",
        college: "IIM Bangalore",
        school: "DPS RK Puram",
        additionalSkills: "Digital Marketing, Public Speaking",
      },
      professional: {
        occupation: "Senior Marketing Manager",
        company: "TechGlobal Solutions",
        income: "24 LPA",
        experience: "5 Years",
      },
      partnerPreferences: {
        summary: "Looking for a kind, educated, and family-oriented partner who values mutual respect and open communication. Preference for someone with a balanced approach to career and family life. Compatibility in values, lifestyle, and long-term goals is important.",
        customFields: [],
      },
      templateId: data.templateId,
      country: data.country,
      language: data.language,
      images: [],
      profileImage: data.profileImage,
      profileImageCrop: data.profileImageCrop,
      customization: {
        primaryColor: data.templateId === 'modern' ? '#0f172a' : data.templateId === 'creative' ? '#10b981' : '#92400e',
        backgroundColor: '#ffffff',
        fontFamily: data.templateId === 'modern' ? 'sans' : 'serif',
        classicVariant: data.customization.classicVariant || 'centered',
        classicFrameStyle: data.customization.classicFrameStyle || 'royal',
        classicHeaderText: data.customization.classicHeaderText || 'ॐ श्री गणेशाय नमः',
        classicHeaderIcon: data.customization.classicHeaderIcon || 'Ganesha',
        classicHeaderPosition: data.customization.classicHeaderPosition,
        classicPhotoPosition: data.customization.classicPhotoPosition,
        classicPersonalPhotoShape: data.customization.classicPersonalPhotoShape || 'rectangle',
        photoLayout: data.customization.photoLayout || 'grid',
        godLogo: data.customization.godLogo || 'None',
        selectedGodLogos: data.customization.selectedGodLogos || (data.customization.godLogo && data.customization.godLogo !== 'None' ? [data.customization.godLogo] : []),
        godLogoPosition: data.customization.godLogoPosition,
        godLogoPositions: data.customization.godLogoPositions || {},
        godLogoSize: data.customization.godLogoSize || 24,
        godLogoOpacity: data.customization.godLogoOpacity ?? 0.75,
        sectionVisibility: {
          personal: true,
          family: true,
          education: true,
          professional: true,
          partnerPreferences: true,
        },
      },
    });
  };

  return {
    data,
    labels,
    updateField,
    addCustomField,
    removeCustomField,
    updateCustomField,
    setTemplate,
    setCountry,
    setLanguage,
    updateCustomization,
    toggleSectionVisibility,
    addImage,
    removeImage,
    updateProfileImage,
    handleAiEnhance,
    handleGeneratePartnerPreferences,
    loadSampleData,
    isGenerating,
    isGeneratingPartnerPreferences,
    error,
  };
};
