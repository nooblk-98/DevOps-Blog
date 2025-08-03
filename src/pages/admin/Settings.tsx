import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';

interface BannerSettings {
  title: string;
  subtitle: string;
  image_url: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<BannerSettings>({ title: '', subtitle: '', image_url: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'banner')
        .single();

      if (error) {
        showError('Failed to fetch settings');
        console.error(error);
      } else if (data) {
        setSettings(data.value as BannerSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('settings')
      .update({ value: settings })
      .eq('key', 'banner');

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Settings updated successfully!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
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
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage your site's appearance and configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-lg font-semibold">Homepage Banner</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Banner Title</Label>
              <Input id="title" name="title" value={settings.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Banner Subtitle</Label>
              <Input id="subtitle" name="subtitle" value={settings.subtitle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Banner Image URL</Label>
              <Input id="image_url" name="image_url" value={settings.image_url} onChange={handleChange} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};