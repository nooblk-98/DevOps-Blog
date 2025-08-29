import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { showError, showSuccess } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/context/SettingsContext'

export default function AdminSettingsSharing(){
  const { refreshSettings } = useSettings()
  const [enabled, setEnabled] = useState(true)
  useEffect(()=>{ supabase.from('settings').select('key,value').then(({data})=>{ const v=data?.find(x=>x.key==='social_sharing')?.value; if(v) setEnabled(!!v.enabled) }) },[])
  const save = async ()=>{ const { error } = await supabase.from('settings').upsert({ key:'social_sharing', value: { enabled } }, { onConflict:'key' }); if(error) showError(error.message); else { showSuccess('Saved'); refreshSettings() } }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Sharing</CardTitle>
        <CardDescription>Enable or disable buttons on post pages.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Switch id="sharing" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="sharing">Enable Social Sharing Buttons</Label>
        <div className="ml-auto"><Button onClick={save}>Save</Button></div>
      </CardContent>
    </Card>
  )
}

