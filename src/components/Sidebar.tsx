import React from 'react';
import { Biodata, CustomField, SectionOrderKey } from '../types';
import { TranslationLabels } from '../constants/translations';
import { ChevronDown, ChevronRight, User, Users, GraduationCap, Briefcase, Sparkles, Plus, Trash2, X, Camera, Crop as CropIcon, Wand2, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';
import { CustomizationPanel } from './CustomizationPanel';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

interface SidebarProps {
  data: Biodata;
  labels: TranslationLabels;
  isDarkMode?: boolean;
  onUpdate: (section: keyof Biodata, field: string, value: string) => void;
  onAddCustomField: (section: keyof Biodata) => void;
  onRemoveCustomField: (section: keyof Biodata, id: string) => void;
  onUpdateCustomField: (section: keyof Biodata, id: string, field: 'label' | 'value', value: string) => void;
  onLoadSample: () => void;
  onGeneratePartnerPreferences: () => void;
  onUpdateCustomization: (field: keyof Biodata['customization'], value: any) => void;
  onToggleVisibility: (section: keyof Biodata['customization']['sectionVisibility']) => void;
  onUpdateProfileImage: (image: string | undefined, crop?: { x: number; y: number; width: number; height: number }) => void;
  isGeneratingPartnerPreferences: boolean;
}

const FormSection = ({
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
  onAdd,
  isDarkMode = false
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  isDarkMode?: boolean;
}) => (
  <div className={clsx("border-b last:border-0", isDarkMode ? "border-slate-700" : "border-gray-200")}>
    <button
      onClick={onToggle}
      className={clsx(
        "w-full flex items-center justify-between p-4 sm:p-4 transition-colors text-left min-h-14",
        isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={clsx("p-2 rounded-lg", isOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
          <Icon size={20} />
        </div>
        <span
          className={clsx(
            "font-semibold text-[15px]",
            isDarkMode
              ? (isOpen ? "text-slate-100" : "text-slate-300")
              : (isOpen ? "text-gray-900" : "text-gray-600")
          )}
        >
          {title}
        </span>
      </div>
      {isOpen ? (
        <ChevronDown size={16} className={isDarkMode ? "text-slate-400" : "text-gray-400"} />
      ) : (
        <ChevronRight size={16} className={isDarkMode ? "text-slate-400" : "text-gray-400"} />
      )}
    </button>

    {isOpen && (
      <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
        {children}
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-[15px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 border-dashed mt-4"
          >
            <Plus size={14} />
            Add Field
          </button>
        )}
      </div>
    )}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  onDelete
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  onDelete?: () => void;
}) => (
  <div className="relative group">
    <div className="flex justify-between items-center mb-1">
      <label className="block text-[11px] font-semibold text-gray-600">{label}</label>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Clear field"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
    {type === 'textarea' ? (
      <textarea
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-[15px] leading-6"
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-[15px] leading-6"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    )}
  </div>
);

interface CustomFieldInputProps {
  field: CustomField;
  onUpdate: (id: string, key: 'label' | 'value', value: string) => void;
  onRemove: (id: string) => void;
}

const CustomFieldInput: React.FC<CustomFieldInputProps> = ({
  field,
  onUpdate,
  onRemove
}) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
    <button
      onClick={() => onRemove(field.id)}
      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      title="Remove field"
    >
      <X size={14} />
    </button>
    <div className="space-y-2">
      <input
        type="text"
        className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none text-[12px] font-semibold text-gray-700 placeholder-gray-400 pb-1"
        value={field.label}
        onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
        placeholder="Field Label"
      />
      <input
        type="text"
        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-[15px] leading-6"
        value={field.value}
        onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
        placeholder="Value"
      />
    </div>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  data,
  labels,
  isDarkMode = false,
  onUpdate,
  onAddCustomField,
  onRemoveCustomField,
  onUpdateCustomField,
  onLoadSample,
  onGeneratePartnerPreferences,
  onUpdateCustomization,
  onToggleVisibility,
  onUpdateProfileImage,
  isGeneratingPartnerPreferences
}) => {
  const [openSection, setOpenSection] = React.useState<string>('personal');
  const [activeTab, setActiveTab] = React.useState<'content' | 'design'>('content');

  // Cropping State
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);
  const [isCropping, setIsCropping] = React.useState(false);
  const [tempProfileImage, setTempProfileImage] = React.useState<string | null>(null);
  const [cropShapeMode, setCropShapeMode] = React.useState<'circle' | 'square' | 'rectangle'>(
    (data.customization.classicPersonalPhotoShape as 'circle' | 'square' | 'rectangle') || 'rectangle'
  );
  const [isSectionOrderOpen, setIsSectionOrderOpen] = React.useState(false);
  const defaultSectionOrder: SectionOrderKey[] = ['personal', 'family', 'educationCareer', 'partnerPreferences', 'contact'];
  const currentSectionOrder = (data.customization.sectionOrder?.length
    ? data.customization.sectionOrder
    : defaultSectionOrder
  ) as SectionOrderKey[];
  const orderedSections: SectionOrderKey[] = [
    ...currentSectionOrder.filter((section) => defaultSectionOrder.includes(section)),
    ...defaultSectionOrder.filter((section) => !currentSectionOrder.includes(section)),
  ];
  const sectionOrderLabelMap: Record<SectionOrderKey, string> = {
    personal: labels.personalDetails,
    family: labels.familyBackground,
    educationCareer: labels.educationCareer,
    partnerPreferences: labels.partnerPreferences || 'Partner Preferences',
    contact: labels.contact,
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempProfileImage(reader.result);
          setCrop({ x: 0, y: 0 });
          setZoom(1.2);
          setCropShapeMode((data.customization.classicPersonalPhotoShape as 'circle' | 'square' | 'rectangle') || 'rectangle');
          setIsCropping(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async () => {
    if (tempProfileImage && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempProfileImage, croppedAreaPixels);
        if (croppedImage) {
          onUpdateProfileImage(croppedImage, croppedAreaPixels);
          onUpdateCustomization('classicPersonalPhotoShape', cropShapeMode);
          setIsCropping(false);
          setTempProfileImage(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const renderCustomFields = (section: keyof Biodata) => {
    const sectionData = data[section] as any;
    if (!sectionData.customFields) return null;

    return sectionData.customFields.map((field: CustomField) => (
      <CustomFieldInput
        key={field.id}
        field={field}
        onUpdate={(id, key, value) => onUpdateCustomField(section, id, key, value)}
        onRemove={(id) => onRemoveCustomField(section, id)}
      />
    ));
  };

  const moveSectionByIndex = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedSections.length) return;
    const next = [...orderedSections];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onUpdateCustomization('sectionOrder', next);
  };

  return (
    <div className={clsx("sidebar-panel h-full overflow-y-auto w-full flex-shrink-0 shadow-xl z-10 flex flex-col", isDarkMode ? 'bg-slate-900 border-r border-slate-700' : 'bg-white border-r border-gray-200')}>
      <div className={clsx("p-6 border-b", isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50')}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={clsx("text-2xl font-extrabold tracking-tight", isDarkMode ? 'text-slate-100' : 'text-gray-800')}>Biodata Editor</h2>
            <p className={clsx("text-[15px] mt-1", isDarkMode ? 'text-slate-400' : 'text-gray-500')}>Customize your profile</p>
          </div>
          <button
            onClick={onLoadSample}
            className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
            title="Load Sample Data"
          >
            <Sparkles size={12} />
            Auto-Fill
          </button>
        </div>

        <div className={clsx("flex p-1 rounded-lg", isDarkMode ? 'bg-slate-700' : 'bg-gray-200')}>
          <button
            onClick={() => setActiveTab('content')}
            className={clsx(
              "flex-1 py-2 text-[15px] font-semibold rounded-md transition-all",
              activeTab === 'content'
                ? isDarkMode
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-gray-900 shadow-sm"
                : isDarkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
            )}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={clsx(
              "flex-1 py-2 text-[15px] font-semibold rounded-md transition-all",
              activeTab === 'design'
                ? isDarkMode
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-gray-900 shadow-sm"
                : isDarkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
            )}
          >
            Design
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' ? (
          <div className="divide-y divide-gray-100">
            {data.templateId === 'classic' && (
              <div className={clsx("p-4", isDarkMode ? "bg-slate-900 border-b border-slate-700" : "bg-white")}>
                <button
                  onClick={() => setIsSectionOrderOpen((prev) => !prev)}
                  className={clsx(
                    "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left",
                    isDarkMode ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"
                  )}
                >
                  <span className={clsx("text-[12px] font-bold uppercase tracking-wide", isDarkMode ? "text-slate-400" : "text-gray-500")}>
                    Section Order
                  </span>
                  {isSectionOrderOpen ? (
                    <ChevronDown size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                  ) : (
                    <ChevronRight size={16} className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
                  )}
                </button>
                {isSectionOrderOpen && (
                  <div className="space-y-2 mt-3">
                    {orderedSections.map((sectionKey, index) => (
                      <div
                        key={sectionKey}
                        className={clsx(
                          "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-[14px] font-medium",
                          isDarkMode ? "border-slate-700 bg-slate-800 text-slate-200" : "border-gray-200 bg-gray-50 text-gray-700"
                        )}
                      >
                        <span>{sectionOrderLabelMap[sectionKey]}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSectionByIndex(index, 'up')}
                            disabled={index === 0}
                            className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveSectionByIndex(index, 'down')}
                            disabled={index === orderedSections.length - 1}
                            className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <FormSection
              title={labels.profilePicture || 'Profile Picture'}
              icon={Camera}
              isOpen={openSection === 'profile'}
              onToggle={() => toggleSection('profile')}
              isDarkMode={isDarkMode}
            >
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50">
                  {data.profileImage ? (
                    <img src={data.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                      <User size={48} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Camera size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                  </label>
                </div>
                {data.profileImage && (
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => {
                        setTempProfileImage(data.profileImage || null);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1.2);
                        setCropShapeMode((data.customization.classicPersonalPhotoShape as 'circle' | 'square' | 'rectangle') || 'rectangle');
                        setIsCropping(true);
                      }}
                      className="text-[13px] flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-3 py-2 rounded-full transition-colors"
                    >
                      <CropIcon size={14} />
                      Crop / Edit
                    </button>
                    <button
                      onClick={() => onUpdateProfileImage(undefined)}
                      className="text-[13px] flex items-center gap-1.5 text-red-500 hover:text-red-700 font-semibold bg-red-50 px-3 py-2 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                )}
                {!data.profileImage && (
                  <label className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer bg-indigo-50 px-4 py-2.5 rounded-lg transition-colors border border-indigo-100">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection
              title={labels.personalDetails}
              icon={User}
              isOpen={openSection === 'personal'}
              onToggle={() => toggleSection('personal')}
              onAdd={() => onAddCustomField('personal')}
              isDarkMode={isDarkMode}
            >
              <InputField label={labels.fullName} value={data.personal.fullName} onChange={(e) => onUpdate('personal', 'fullName', e.target.value)} placeholder="e.g. John Doe" onDelete={() => onUpdate('personal', 'fullName', '')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label={labels.dob} type="date" value={data.personal.dob} onChange={(e) => onUpdate('personal', 'dob', e.target.value)} onDelete={() => onUpdate('personal', 'dob', '')} />
                <InputField label={labels.gender} value={data.personal.gender} onChange={(e) => onUpdate('personal', 'gender', e.target.value)} placeholder="e.g. Male" onDelete={() => onUpdate('personal', 'gender', '')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label={labels.height} value={data.personal.height} onChange={(e) => onUpdate('personal', 'height', e.target.value)} placeholder="e.g. 5 ft 10 in" onDelete={() => onUpdate('personal', 'height', '')} />
                <InputField label={labels.complexion} value={data.personal.complexion} onChange={(e) => onUpdate('personal', 'complexion', e.target.value)} placeholder="e.g. Fair" onDelete={() => onUpdate('personal', 'complexion', '')} />
              </div>
              <InputField label={labels.maritalStatus} value={data.personal.maritalStatus} onChange={(e) => onUpdate('personal', 'maritalStatus', e.target.value)} placeholder="e.g. Single" onDelete={() => onUpdate('personal', 'maritalStatus', '')} />
              <InputField label={labels.languages} value={data.personal.languages} onChange={(e) => onUpdate('personal', 'languages', e.target.value)} placeholder="e.g. English, Hindi, Spanish" onDelete={() => onUpdate('personal', 'languages', '')} />
              <InputField label={labels.hobbies} type="textarea" value={data.personal.hobbies} onChange={(e) => onUpdate('personal', 'hobbies', e.target.value)} placeholder="e.g. Reading, Traveling" onDelete={() => onUpdate('personal', 'hobbies', '')} />
              <InputField label={labels.contact} value={data.personal.contact} onChange={(e) => onUpdate('personal', 'contact', e.target.value)} placeholder="e.g. +1 234 567 890" onDelete={() => onUpdate('personal', 'contact', '')} />
              <InputField label={labels.email} type="email" value={data.personal.email} onChange={(e) => onUpdate('personal', 'email', e.target.value)} placeholder="e.g. john@example.com" onDelete={() => onUpdate('personal', 'email', '')} />
              <InputField label={labels.address} type="textarea" value={data.personal.address} onChange={(e) => onUpdate('personal', 'address', e.target.value)} placeholder="e.g. 123 Main St, City, Country" onDelete={() => onUpdate('personal', 'address', '')} />

              {renderCustomFields('personal')}
            </FormSection>

            <FormSection
              title={labels.familyBackground}
              icon={Users}
              isOpen={openSection === 'family'}
              onToggle={() => toggleSection('family')}
              onAdd={() => onAddCustomField('family')}
              isDarkMode={isDarkMode}
            >
              <InputField label={labels.fatherName} value={data.family.fatherName} onChange={(e) => onUpdate('family', 'fatherName', e.target.value)} onDelete={() => onUpdate('family', 'fatherName', '')} />
              <InputField label={labels.fatherOccupation} value={data.family.fatherOccupation} onChange={(e) => onUpdate('family', 'fatherOccupation', e.target.value)} onDelete={() => onUpdate('family', 'fatherOccupation', '')} />
              <InputField label={labels.motherName} value={data.family.motherName} onChange={(e) => onUpdate('family', 'motherName', e.target.value)} onDelete={() => onUpdate('family', 'motherName', '')} />
              <InputField label={labels.motherOccupation} value={data.family.motherOccupation} onChange={(e) => onUpdate('family', 'motherOccupation', e.target.value)} onDelete={() => onUpdate('family', 'motherOccupation', '')} />
              <InputField label={labels.siblings} value={data.family.siblings} onChange={(e) => onUpdate('family', 'siblings', e.target.value)} placeholder="e.g. 1 Brother, 1 Sister" onDelete={() => onUpdate('family', 'siblings', '')} />
              <InputField label={labels.familyType} value={data.family.familyType} onChange={(e) => onUpdate('family', 'familyType', e.target.value)} placeholder="e.g. Nuclear / Joint" onDelete={() => onUpdate('family', 'familyType', '')} />
              <InputField label={labels.nativePlace} value={data.family.nativePlace} onChange={(e) => onUpdate('family', 'nativePlace', e.target.value)} onDelete={() => onUpdate('family', 'nativePlace', '')} />

              {renderCustomFields('family')}
            </FormSection>

            <FormSection
              title={labels.education}
              icon={GraduationCap}
              isOpen={openSection === 'education'}
              onToggle={() => toggleSection('education')}
              onAdd={() => onAddCustomField('education')}
              isDarkMode={isDarkMode}
            >
              <InputField label={labels.qualification} value={data.education.highestQualification} onChange={(e) => onUpdate('education', 'highestQualification', e.target.value)} placeholder="e.g. MBA / B.Tech" onDelete={() => onUpdate('education', 'highestQualification', '')} />
              <InputField label={labels.college} value={data.education.college} onChange={(e) => onUpdate('education', 'college', e.target.value)} onDelete={() => onUpdate('education', 'college', '')} />
              <InputField label={labels.school} value={data.education.school} onChange={(e) => onUpdate('education', 'school', e.target.value)} onDelete={() => onUpdate('education', 'school', '')} />
              <InputField label={labels.skills} type="textarea" value={data.education.additionalSkills} onChange={(e) => onUpdate('education', 'additionalSkills', e.target.value)} onDelete={() => onUpdate('education', 'additionalSkills', '')} />

              {renderCustomFields('education')}
            </FormSection>

            <FormSection
              title={labels.professional}
              icon={Briefcase}
              isOpen={openSection === 'professional'}
              onToggle={() => toggleSection('professional')}
              onAdd={() => onAddCustomField('professional')}
              isDarkMode={isDarkMode}
            >
              <InputField label={labels.occupation} value={data.professional.occupation} onChange={(e) => onUpdate('professional', 'occupation', e.target.value)} placeholder="e.g. Software Engineer" onDelete={() => onUpdate('professional', 'occupation', '')} />
              <InputField label={labels.company} value={data.professional.company} onChange={(e) => onUpdate('professional', 'company', e.target.value)} onDelete={() => onUpdate('professional', 'company', '')} />
              <InputField label={labels.income} value={data.professional.income} onChange={(e) => onUpdate('professional', 'income', e.target.value)} placeholder="e.g. $80,000 / year" onDelete={() => onUpdate('professional', 'income', '')} />
              <InputField label={labels.experience} value={data.professional.experience} onChange={(e) => onUpdate('professional', 'experience', e.target.value)} placeholder="e.g. 5 Years" onDelete={() => onUpdate('professional', 'experience', '')} />

              {renderCustomFields('professional')}
            </FormSection>

            <FormSection
              title={labels.partnerPreferences || 'Partner Preferences'}
              icon={Wand2}
              isOpen={openSection === 'partnerPreferences'}
              onToggle={() => toggleSection('partnerPreferences')}
              onAdd={() => onAddCustomField('partnerPreferences')}
              isDarkMode={isDarkMode}
            >
              <button
                onClick={onGeneratePartnerPreferences}
                disabled={isGeneratingPartnerPreferences}
                className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPartnerPreferences ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isGeneratingPartnerPreferences ? 'Generating...' : 'Generate with AI'}
              </button>
              <InputField
                label="Summary"
                type="textarea"
                value={data.partnerPreferences.summary}
                onChange={(e) => onUpdate('partnerPreferences', 'summary', e.target.value)}
                placeholder="e.g. Looking for a kind, compatible, and family-oriented partner..."
                onDelete={() => onUpdate('partnerPreferences', 'summary', '')}
              />
              {renderCustomFields('partnerPreferences')}
            </FormSection>
          </div>
        ) : (
          <CustomizationPanel
            data={data}
            labels={labels}
            isDarkMode={isDarkMode}
            onUpdateCustomization={onUpdateCustomization}
            onToggleVisibility={onToggleVisibility}
          />
        )}
      </div>

      {/* Crop Modal */}
      {isCropping && tempProfileImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CropIcon size={18} />
                Adjust Photo
              </h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="relative w-full h-80 bg-gray-900">
              <Cropper
                image={tempProfileImage}
                crop={crop}
                zoom={zoom}
                aspect={cropShapeMode === 'rectangle' ? 3 / 4 : 1}
                cropShape={cropShapeMode === 'circle' ? 'round' : 'rect'}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                minZoom={1}
                maxZoom={4}
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-200 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase">Shape</span>
                {(['circle', 'square', 'rectangle'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setCropShapeMode(shape)}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                      cropShapeMode === shape
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {shape[0].toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 uppercase min-w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Drag image to reposition and use zoom to make photo larger
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCropping(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCrop}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
