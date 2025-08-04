import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { showLoading, showError, showSuccess, dismissToast } from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export const AdminBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    const toastId = showLoading('Creating backup... This may take a while.');

    try {
      const { data: blob, error } = await supabase.functions.invoke('backup');

      if (error) throw error;
      if (!(blob instanceof Blob)) {
          throw new Error('Backup function did not return a valid file.');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `backup-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      dismissToast(toastId);
      showSuccess('Backup created and downloaded successfully!');
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || 'Failed to create backup.');
      console.error(error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      showError('Please select a backup file to restore.');
      return;
    }

    if (!window.confirm('ARE YOU ABSOLUTELY SURE?\n\nThis will completely wipe your current content (posts, categories, comments, settings, and images) and replace it with the content from the backup file. This action cannot be undone.')) {
      return;
    }

    setIsRestoring(true);
    const toastId = showLoading('Restoring from backup... Please do not close this page.');

    try {
      const { error } = await supabase.functions.invoke('restore', {
        body: restoreFile,
        headers: {
          'Content-Type': restoreFile.type,
        }
      });

      if (error) throw error;

      dismissToast(toastId);
      showSuccess('Restore successful! The page will now reload.');
      setTimeout(() => window.location.reload(), 2000);

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || 'Failed to restore from backup.');
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Backup & Restore</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Backup</CardTitle>
            <CardDescription>
              Download a zip file containing all your site's content, including posts, categories, settings, and uploaded images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup} disabled={isBackingUp}>
              {isBackingUp ? 'Creating Backup...' : 'Download Backup File'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restore from Backup</CardTitle>
            <CardDescription>
              Restore your site's content from a previously created backup file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Warning: Destructive Action</AlertTitle>
              <AlertDescription>
                Restoring from a backup will permanently delete all existing content and images. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="restore-file">Backup File (.zip)</Label>
              <Input 
                id="restore-file" 
                type="file" 
                accept=".zip,application/zip"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                disabled={isRestoring}
              />
            </div>
            <Button onClick={handleRestore} disabled={isRestoring || !restoreFile} variant="destructive">
              {isRestoring ? 'Restoring...' : 'Restore from File'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};