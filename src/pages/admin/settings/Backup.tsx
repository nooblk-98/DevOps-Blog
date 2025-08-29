import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { showError, showSuccess } from '@/utils/toast'

export default function AdminSettingsBackup(){
  const [busyBackup, setBusyBackup] = useState(false)
  const [busyRestore, setBusyRestore] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>Download a full backup (DB + media) or restore from a file.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center">
          <Button type="button" variant="outline" disabled={busyBackup} onClick={async()=>{
            try{ setBusyBackup(true); const resp = await fetch('/api/admin/backup',{credentials:'include'}); if(!resp.ok) throw new Error(); const blob=await resp.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`backup-${new Date().toISOString().replace(/[:.]/g,'-')}.zip`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);}catch{ showError('Failed to download backup') } finally{ setBusyBackup(false) }
          }}>Download Backup</Button>
          <div>
            <input id="restore-file" type="file" className="sr-only" accept=".zip,.sqlite,.db,application/zip,application/octet-stream" onChange={async(e)=>{
              const file=e.target.files?.[0]; if(!file) return; try{ setBusyRestore(true); const form=new FormData(); form.append('file', file); const resp=await fetch('/api/admin/restore',{ method:'POST', credentials:'include', body: form }); if(!resp.ok) throw new Error(); showSuccess('Restore successful'); }catch{ showError('Failed to restore') } finally{ setBusyRestore(false); e.currentTarget.value='' }
            }} />
            <Button type="button" variant="destructive" disabled={busyRestore} onClick={()=>document.getElementById('restore-file')?.click()}>Restore from File</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

