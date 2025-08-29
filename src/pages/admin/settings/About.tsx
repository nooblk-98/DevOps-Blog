import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { showError, showSuccess } from '@/utils/toast'
import { useSettings } from '@/context/SettingsContext'

export default function AdminSettingsAbout(){
  const { refreshSettings } = useSettings()
  const [content, setContent] = useState('')
  useEffect(()=>{ supabase.from('settings').select('key,value').then(({data})=>{ const v=data?.find(x=>x.key==='about_page_content')?.value; if(v) setContent(v) }) },[])
  const save = async () => {
    const { error } = await supabase.from('settings').upsert({ key:'about_page_content', value: content }, { onConflict:'key' })
    if (error) showError(error.message); else { showSuccess('Saved'); refreshSettings() }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Page Content</CardTitle>
        <CardDescription>Edit the content displayed on your About page.</CardDescription>
      </CardHeader>
      <CardContent>
        <RichTextEditor value={content} onChange={setContent} placeholder="Write your About Us content here..." toolbarSticky={false} />
        <div className="mt-4 flex justify-end"><Button onClick={save}>Save</Button></div>
      </CardContent>
    </Card>
  )
}
