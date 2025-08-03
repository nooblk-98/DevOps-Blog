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

interface Settings {
  site: SiteSettings;
  banner: BannerSettings;
  loading: boolean;
  refreshSettings: () => void;
}

const defaultSettings: Settings = {
  site: { name: 'DevOps Zone', logo_url: '' },
  banner: { title: 'Welcome to DevOps Zone', subtitle: 'Your one-stop destination for DevOps tutorials and best practices.', image_url: '' },
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

    const newSettings: Partial<Pick<Settings, 'site' | 'banner'>> = {};
    for (const setting of data) {
      if (setting.key === 'site') {
        newSettings.site = setting.value as SiteSettings;
      } else if (setting.key === 'banner') {
        newSettings.banner = setting.value as BannerSettings;
      }
    }
    
    setSettings(prev => ({
      ...prev,
      site: newSettings.site || prev.site,
      banner: newSettings.banner || prev.banner,
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