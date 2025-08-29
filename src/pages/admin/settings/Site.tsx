import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/context/SettingsContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { showError, showSuccess } from '@/utils/toast'
import { ImageUploadDialog } from '@/components/ImageUploadDialog'

export default function AdminSettingsSite() {
  const { refreshSettings } = useSettings()
  const [site, setSite] = useState<{ name: string; logo_url: string; favicon_url?: string }>({ name:'', logo_url:'', favicon_url:'' })
  const [logoOpen, setLogoOpen] = useState(false)
  const [favOpen, setFavOpen] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('key,value').then(({data}) => {
      const s = data?.find(x=>x.key==='site')?.value
      if (s) setSite(s)
    })
  }, [])

  const save = async () => {
    const { error } = await supabase.from('settings').upsert({ key:'site', value: site }, { onConflict:'key' })
    if (error) showError(error.message); else { showSuccess('Saved'); refreshSettings() }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Site Identity</CardTitle>
          <CardDescription>Manage your site's name, logo and favicon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input id="name" value={site.name} onChange={e=>setSite({...site, name:e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <div className="flex items-center gap-3">
              <Input value={site.logo_url} onChange={e=>setSite({...site, logo_url:e.target.value})} placeholder="https://.../logo.png" />
              <Button type="button" variant="outline" onClick={()=>setLogoOpen(true)}>Select</Button>
            </div>
            {site.logo_url && <img src={site.logo_url} alt="Logo" className="h-10 mt-2" />}
          </div>
          <div className="space-y-2">
            <Label>Favicon URL (32x32)</Label>
            <div className="flex items-center gap-3">
              <Input value={site.favicon_url || ''} onChange={e=>setSite({...site, favicon_url:e.target.value})} placeholder="https://.../favicon.png" />
              <Button type="button" variant="outline" onClick={()=>setFavOpen(true)}>Select</Button>
            </div>
            {site.favicon_url && <img src={site.favicon_url} alt="Favicon" className="h-8 w-8 mt-2" />}
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>
      <ImageUploadDialog isOpen={logoOpen} onClose={()=>setLogoOpen(false)} onInsert={(u)=>{ setSite({...site, logo_url:u}); setLogoOpen(false) }} />
      <ImageUploadDialog isOpen={favOpen} onClose={()=>setFavOpen(false)} onInsert={(u)=>{ setSite({...site, favicon_url:u}); setFavOpen(false) }} />
    </>
  )
}

