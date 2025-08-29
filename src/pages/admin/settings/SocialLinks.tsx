import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showError, showSuccess } from '@/utils/toast'
import { useSettings } from '@/context/SettingsContext'

type Links = {
  github: { url: string; enabled: boolean }
  whatsapp: { url: string; enabled: boolean }
  linkedin: { url: string; enabled: boolean }
  facebook: { url: string; enabled: boolean }
  instagram: { url: string; enabled: boolean }
}

export default function AdminSettingsSocialLinks(){
  const { refreshSettings } = useSettings()
  const [links, setLinks] = useState<Links>({ github:{url:'',enabled:false}, whatsapp:{url:'',enabled:false}, linkedin:{url:'',enabled:false}, facebook:{url:'',enabled:false}, instagram:{url:'',enabled:false} })
  useEffect(()=>{ supabase.from('settings').select('key,value').then(({data})=>{ const v=data?.find(x=>x.key==='social_links')?.value; if(v) setLinks(v) }) },[])
  const save = async ()=>{ const { error } = await supabase.from('settings').upsert({ key:'social_links', value: links }, { onConflict:'key' }); if(error) showError(error.message); else { showSuccess('Saved'); refreshSettings() } }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>Manage links displayed in the footer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(links).map(([platform, { url, enabled }]) => (
          <div key={platform} className="flex items-center space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`${platform}-url`}>{platform.charAt(0).toUpperCase()+platform.slice(1)} URL</Label>
              <Input id={`${platform}-url`} value={url} onChange={(e)=> setLinks(prev=>({ ...prev, [platform]: { ...prev[platform as keyof Links], url: e.target.value } as any }))} placeholder={`https://${platform}.com/yourprofile`} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id={`${platform}-enabled`} checked={enabled} onCheckedChange={(v)=> setLinks(prev=>({ ...prev, [platform]: { ...prev[platform as keyof Links], enabled: v } as any }))} />
              <Label htmlFor={`${platform}-enabled`}>Enabled</Label>
            </div>
          </div>
        ))}
        <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
      </CardContent>
    </Card>
  )
}

