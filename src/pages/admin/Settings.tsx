import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImageUploadDialog } from '@/components/ImageUploadDialog';
import { Switch } from '@/components/ui/switch';

interface BannerSettings {
  title: string;
  subtitle: string;
  image_url: string;
}

interface SiteSettings {
  name: string;
  logo_url: string;
  favicon_url?: string;
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

export const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({ title: '', subtitle: '', image_url: '' });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ name: '', logo_url: '', favicon_url: '' });
  const [aboutContent, setAboutContent] = useState<string>('');
  const [socialSharingSettings, setSocialSharingSettings] = useState<SocialSharingSettings>({ enabled: true });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    github: { url: '', enabled: false },
    whatsapp: { url: '', enabled: false },
    linkedin: { url: '', enabled: false },
    facebook: { url: '', enabled: false },
    instagram: { url: '', enabled: false },
  });
  const [loading, setLoading] = useState(true);
  const [isBannerImageDialogOpen, setIsBannerImageDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isFaviconDialogOpen, setIsFaviconDialogOpen] = useState(false);
  const [busyBackup, setBusyBackup] = useState(false);
  const [busyRestore, setBusyRestore] = useState(false);

  const sections = [
    { id: 'site', label: 'Site Identity' },
    { id: 'banner', label: 'Homepage Banner' },
    { id: 'about', label: 'About Page' },
    { id: 'backup', label: 'Backup & Restore' },
    { id: 'sharing', label: 'Social Sharing' },
    { id: 'social', label: 'Social Links' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

        const about = data.find(s => s.key === 'about_page_content')?.value;
        if (about) setAboutContent(about);

        const social = data.find(s => s.key === 'social_sharing')?.value;
        if (social) setSocialSharingSettings(social);

        const links = data.find(s => s.key === 'social_links')?.value;
        if (links) setSocialLinks(links);
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

    const { error: aboutError } = await supabase
      .from('settings')
      .upsert({ key: 'about_page_content', value: aboutContent }, { onConflict: 'key' });

    const { error: socialError } = await supabase
      .from('settings')
      .upsert({ key: 'social_sharing', value: socialSharingSettings }, { onConflict: 'key' });

    const { error: socialLinksError } = await supabase
      .from('settings')
      .upsert({ key: 'social_links', value: socialLinks }, { onConflict: 'key' });

    if (bannerError || siteError || aboutError || socialError || socialLinksError) {
      showError(bannerError?.message || siteError?.message || aboutError?.message || socialError?.message || socialLinksError?.message || 'An error occurred while saving.');
    } else {
      showSuccess('Settings updated successfully!');
      refreshSettings();
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBannerSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerImageInsert = (url: string) => {
    setBannerSettings(prev => ({ ...prev, image_url: url }));
    setIsBannerImageDialogOpen(false);
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoInsert = (url: string) => {
    setSiteSettings(prev => ({ ...prev, logo_url: url }));
    setIsLogoDialogOpen(false);
  }

  const handleFaviconInsert = (url: string) => {
    setSiteSettings(prev => ({ ...prev, favicon_url: url }));
    setIsFaviconDialogOpen(false);
  }

  const handleSocialSharingToggle = (checked: boolean) => {
    setSocialSharingSettings({ enabled: checked });
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, field: 'url' | 'enabled', value: string | boolean) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
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
      {/* Section Nav */}
      <div className="sticky top-0 z-10 mb-4 -mx-2 px-2 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <Button key={s.id} type="button" variant="ghost" size="sm" onClick={() => scrollTo(s.id)}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <section id="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Identity</CardTitle>
              <CardDescription>Manage your site's name, logo and favicon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name</Label>
                <Input id="name" name="name" value={siteSettings.name} onChange={handleSiteChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <div className="flex items-center gap-3">
                  <Input id="logo_url" name="logo_url" value={siteSettings.logo_url} onChange={handleSiteChange} placeholder="https://your-domain.com/logo.png" />
                  <Button type="button" variant="outline" onClick={() => setIsLogoDialogOpen(true)}>Select</Button>
                </div>
                {siteSettings.logo_url && (
                  <div className="mt-2">
                    <img src={siteSettings.logo_url} alt="Logo preview" className="h-10 w-auto" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon_url">Favicon URL (32x32)</Label>
                <div className="flex items-center gap-3">
                  <Input id="favicon_url" name="favicon_url" value={siteSettings.favicon_url || ''} onChange={handleSiteChange} placeholder="https://your-domain.com/favicon.png" />
                  <Button type="button" variant="outline" onClick={() => setIsFaviconDialogOpen(true)}>Select</Button>
                </div>
                {siteSettings.favicon_url && (
                  <div className="mt-2">
                    <img src={siteSettings.favicon_url} alt="Favicon preview" className="h-8 w-8" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </section>

          <section id="banner">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Banner</CardTitle>
              <CardDescription>Manage the content of the banner on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Title</Label>
                <RichTextEditor value={bannerSettings.title} onChange={(v) => setBannerSettings(prev => ({ ...prev, title: v }))} placeholder="Enter banner title..." />
              </div>
              <div className="space-y-2">
                <Label>Banner Subtitle</Label>
                <RichTextEditor value={bannerSettings.subtitle} onChange={(v) => setBannerSettings(prev => ({ ...prev, subtitle: v }))} placeholder="Enter banner subtitle..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Banner Image URL</Label>
                <div className="flex items-center gap-3">
                  <Input id="image_url" name="image_url" value={bannerSettings.image_url} onChange={handleBannerChange} placeholder="Paste URL or select from library" />
                  <Button type="button" variant="outline" onClick={() => setIsBannerImageDialogOpen(true)}>Select</Button>
                </div>
                {bannerSettings.image_url && (
                  <div className="mt-2 rounded-md border p-2 max-w-lg">
                    <img src={bannerSettings.image_url} alt="Banner preview" className="w-full h-auto rounded-md" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </section>

          <section id="about">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
              <CardDescription>Edit the content displayed on your About Us page.</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor value={aboutContent} onChange={setAboutContent} placeholder="Write your About Us content here..." />
            </CardContent>
          </Card>
          </section>

          <section id="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Download a backup of your database or restore from a previous backup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Button type="button" variant="outline" disabled={busyBackup} onClick={async () => {
                  try {
                    setBusyBackup(true)
                    const resp = await fetch('/api/admin/backup', { credentials: 'include' })
                    if (!resp.ok) throw new Error('Backup failed')
                    const blob = await resp.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    // Try to use server-provided filename if present
                    const cd = resp.headers.get('Content-Disposition') || ''
                    const m = cd.match(/filename="?([^";]+)"?/i)
                    const fallback = `backup-${new Date().toISOString().replace(/[:.]/g,'-')}.zip`
                    a.download = (m && m[1]) || fallback
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(url)
                  } catch {
                    showError('Failed to download backup')
                  } finally {
                    setBusyBackup(false)
                  }
                }}>Download Backup</Button>

                <div>
                  <input id="restore-file" type="file" className="sr-only" accept=".sqlite,.db,application/octet-stream" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      setBusyRestore(true)
                      const form = new FormData()
                      form.append('file', file)
                      const resp = await fetch('/api/admin/restore', { method: 'POST', credentials: 'include', body: form })
                      if (!resp.ok) throw new Error('Restore failed')
                      showSuccess('Database restored successfully')
                    } catch {
                      showError('Failed to restore backup')
                    } finally {
                      setBusyRestore(false)
                      e.currentTarget.value = ''
                    }
                  }} />
                  <Button type="button" variant="destructive" disabled={busyRestore} onClick={() => document.getElementById('restore-file')?.click()}>Restore from File</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </section>

          <section id="sharing">
          <Card>
            <CardHeader>
              <CardTitle>Social Sharing</CardTitle>
              <CardDescription>Enable or disable social sharing buttons on post pages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="social-sharing-toggle"
                  checked={socialSharingSettings.enabled}
                  onCheckedChange={handleSocialSharingToggle}
                />
                <Label htmlFor="social-sharing-toggle">Enable Social Sharing Buttons</Label>
              </div>
            </CardContent>
          </Card>
          </section>

          <section id="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Manage your social media presence in the footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(socialLinks).map(([platform, { url, enabled }]) => (
                <div key={platform} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`${platform}-url`}>{platform.charAt(0).toUpperCase() + platform.slice(1)} URL</Label>
                    <Input
                      id={`${platform}-url`}
                      value={url}
                      onChange={(e) => handleSocialLinkChange(platform as keyof SocialLinks, 'url', e.target.value)}
                      placeholder={`https://${platform}.com/yourprofile`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${platform}-enabled`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleSocialLinkChange(platform as keyof SocialLinks, 'enabled', checked)}
                    />
                    <Label htmlFor={`${platform}-enabled`}>Enabled</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          </section>
          
          <div className="flex justify-end">
            <Button type="submit">Save All Settings</Button>
          </div>
        </div>
      </form>
      <ImageUploadDialog isOpen={isBannerImageDialogOpen} onClose={() => setIsBannerImageDialogOpen(false)} onInsert={handleBannerImageInsert} />
      <ImageUploadDialog isOpen={isLogoDialogOpen} onClose={() => setIsLogoDialogOpen(false)} onInsert={handleLogoInsert} />
      <ImageUploadDialog isOpen={isFaviconDialogOpen} onClose={() => setIsFaviconDialogOpen(false)} onInsert={handleFaviconInsert} />
    </>
  );
};
