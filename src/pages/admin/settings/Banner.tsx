import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/context/SettingsContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageUploadDialog } from '@/components/ImageUploadDialog'
import { RichTextEditor } from '@/components/RichTextEditor'
import { showError, showSuccess } from '@/utils/toast'

export default function AdminSettingsBanner(){
  const { refreshSettings } = useSettings()
  const [banner, setBanner] = useState<{ title:string; subtitle:string; image_url:string }>({ title:'', subtitle:'', image_url:'' })
  const [open, setOpen] = useState(false)

  useEffect(()=>{ supabase.from('settings').select('key,value').then(({data})=>{ const b=data?.find(x=>x.key==='banner')?.value; if(b) setBanner(b) }) },[])

  const save = async () => {
    const { error } = await supabase.from('settings').upsert({ key:'banner', value: banner }, { onConflict:'key' })
    if (error) showError(error.message); else { showSuccess('Saved'); refreshSettings() }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Banner</CardTitle>
          <CardDescription>Manage banner title, subtitle and image.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Banner Title</Label>
            <RichTextEditor value={banner.title} onChange={(v)=>setBanner({...banner, title:v})} toolbarSticky={false} />
          </div>
          <div className="space-y-2">
            <Label>Banner Subtitle</Label>
            <RichTextEditor value={banner.subtitle} onChange={(v)=>setBanner({...banner, subtitle:v})} toolbarSticky={false} />
          </div>
          <div className="space-y-2">
            <Label>Banner Image URL</Label>
            <div className="flex items-center gap-3">
              <Input value={banner.image_url} onChange={e=>setBanner({...banner, image_url:e.target.value})} placeholder="Paste URL or select from library" />
              <Button type="button" variant="outline" onClick={()=>setOpen(true)}>Select</Button>
            </div>
            {banner.image_url && <img src={banner.image_url} className="mt-2 rounded-md border max-w-lg" />}
          </div>
          <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
        </CardContent>
      </Card>
      <ImageUploadDialog isOpen={open} onClose={()=>setOpen(false)} onInsert={(u)=>{ setBanner({...banner, image_url:u}); setOpen(false) }} />
    </>
  )
}
