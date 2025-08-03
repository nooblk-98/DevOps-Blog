import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';

interface BannerSettings {
  title: string;
  subtitle: string;
  image_url: string;
}

interface SiteSettings {
  name: string;
  logo_url: string;
}

export const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({ title: '', subtitle: '', image_url: '' });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ name: '', logo_url: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('settings').select('key,value');

      if (error) {
        showError('Failed to fetch settings');
        console.error(error);
      } else if (data) {
        const banner = data.find(s => s.key === 'banner')?.value;
        if (banner) setBannerSettings(banner);

        const site = data.find(s => s.key === 'site')?.value;
        if (site) setSiteSettings(site);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error: bannerError } = await supabase
      .from('settings')
      .upsert({ key: 'banner', value: bannerSettings }, { onConflict: 'key' });

    const { error: siteError } = await supabase
      .from('settings')
      .upsert({ key: 'site', value: siteSettings }, { onConflict: 'key' });

    if (bannerError || siteError) {
      showError(bannerError?.message || siteError?.message || 'An error occurred while saving.');
    } else {
      showSuccess('Settings updated successfully!');
      refreshSettings();
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBannerSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Identity</CardTitle>
              <CardDescription>Manage your site's name and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name</Label>
                <Input id="name" name="name" value={siteSettings.name} onChange={handleSiteChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input id="logo_url" name="logo_url" value={siteSettings.logo_url} onChange={handleSiteChange} placeholder="https://your-domain.com/logo.png" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Homepage Banner</CardTitle>
              <CardDescription>Manage the content of the banner on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title</Label>
                <Input id="title" name="title" value={bannerSettings.title} onChange={handleBannerChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Banner Subtitle</Label>
                <Input id="subtitle" name="subtitle" value={bannerSettings.subtitle} onChange={handleBannerChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Banner Image URL</Label>
                <Input id="image_url" name="image_url" value={bannerSettings.image_url} onChange={handleBannerChange} />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit">Save All Settings</Button>
          </div>
        </div>
      </form>
    </>
  );
};