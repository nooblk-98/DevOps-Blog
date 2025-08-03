import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteSettings {
  name: string;
  logo_url: string;
}

interface BannerSettings {
  title: string;
  subtitle: string;
  image_url: string;
}

interface SocialSharingSettings {
  enabled: boolean;
}

interface SocialLinks {
  github: { url: string; enabled: boolean };
  whatsapp: { url: string; enabled: boolean };
  linkedin: { url: string; enabled: boolean };
  facebook: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
}

interface Settings {
  site: SiteSettings;
  banner: BannerSettings;
  aboutPageContent: string;
  socialSharing: SocialSharingSettings;
  socialLinks: SocialLinks; // New social links property
  loading: boolean;
  refreshSettings: () => void;
}

const defaultSettings: Settings = {
  site: { name: 'DevOps Zone', logo_url: '' },
  banner: { title: 'Welcome to DevOps Zone', subtitle: 'Your one-stop destination for DevOps tutorials and best practices.', image_url: '' },
  aboutPageContent: '',
  socialSharing: { enabled: true },
  socialLinks: { // Default social links
    github: { url: '', enabled: false },
    whatsapp: { url: '', enabled: false },
    linkedin: { url: '', enabled: false },
    facebook: { url: '', enabled: false },
    instagram: { url: '', enabled: false },
  },
  loading: true,
  refreshSettings: () => {},
};

const SettingsContext = createContext<Settings>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const fetchSettings = async () => {
    setSettings(prev => ({ ...prev, loading: true }));
    const { data, error } = await supabase.from('settings').select('key,value');

    if (error) {
      console.error('Error fetching settings:', error);
      setSettings(prev => ({ ...prev, loading: false }));
      return;
    }

    const newSettings: Partial<Pick<Settings, 'site' | 'banner' | 'aboutPageContent' | 'socialSharing' | 'socialLinks'>> = {};
    for (const setting of data) {
      if (setting.key === 'site') {
        newSettings.site = setting.value as SiteSettings;
      } else if (setting.key === 'banner') {
        newSettings.banner = setting.value as BannerSettings;
      } else if (setting.key === 'about_page_content') {
        newSettings.aboutPageContent = setting.value as string;
      } else if (setting.key === 'social_sharing') {
        newSettings.socialSharing = setting.value as SocialSharingSettings;
      } else if (setting.key === 'social_links') { // Fetch new social links
        newSettings.socialLinks = setting.value as SocialLinks;
      }
    }
    
    setSettings(prev => ({
      ...prev,
      site: newSettings.site || prev.site,
      banner: newSettings.banner || prev.banner,
      aboutPageContent: newSettings.aboutPageContent || prev.aboutPageContent,
      socialSharing: newSettings.socialSharing || prev.socialSharing,
      socialLinks: newSettings.socialLinks || prev.socialLinks, // Update social links
      loading: false,
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    ...settings,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};