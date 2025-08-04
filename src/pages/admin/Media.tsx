import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import { Upload, Copy, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface StorageFile {
  name: string;
  id: string;
  publicUrl: string;
  path: string;
  created_at: string;
}

export const AdminMedia = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    const [rootList, publicList] = await Promise.all([
      supabase.storage.from('post-images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
      supabase.storage.from('post-images').list('public', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    ]);

    if (rootList.error || publicList.error) {
      showError('Failed to fetch media files.');
      console.error(rootList.error || publicList.error);
      setFiles([]);
      setLoading(false);
      return;
    }

    const rootFiles = (rootList.data || [])
      .filter(file => file.id !== null)
      .map(file => {
        const path = file.name;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        return { ...file, publicUrl, path, id: file.id!, created_at: file.created_at! };
      });

    const publicFiles = (publicList.data || [])
      .filter(file => file.id !== null)
      .map(file => {
        const path = `public/${file.name}`;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        return { ...file, publicUrl, path, id: file.id!, created_at: file.created_at! };
      });

    const allFiles = [...rootFiles, ...publicFiles];
    
    const uniqueFiles = Array.from(new Map(allFiles.map(file => [file.path, file])).values());
    uniqueFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFiles(uniqueFiles as StorageFile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage.from('post-images').upload(filePath, file);
    setUploading(false);

    if (error) {
      showError(`Upload failed: ${error.message}`);
    } else {
      showSuccess('File uploaded successfully!');
      fetchFiles();
    }
    event.target.value = '';
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showSuccess('URL copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    const { error } = await supabase.storage.from('post-images').remove([fileToDelete.path]);
    if (error) {
      showError(`Failed to delete file: ${error.message}`);
    } else {
      showSuccess('File deleted successfully!');
      fetchFiles();
    }
    setFileToDelete(null);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Media Library</h1>
        <Button asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
            <Input id="file-upload" type="file" className="sr-only" onChange={handleUpload} disabled={uploading} accept="image/*" />
          </label>
        </Button>
      </div>
      {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mt-6">
        {loading ? (
          [...Array(12)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="w-full h-32" />
              </CardContent>
              <CardFooter className="p-2 justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </CardFooter>
            </Card>
          ))
        ) : (
          files.map(file => (
            <Card key={file.id}>
              <CardContent className="p-0">
                <img src={file.publicUrl} alt={file.name} className="w-full h-32 object-cover rounded-t-lg" />
              </CardContent>
              <CardFooter className="p-2 justify-between">
                <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(file.publicUrl)} title="Copy URL">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setFileToDelete(file)} title="Delete File">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      {!loading && files.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
          <p className="text-muted-foreground">No media found. Upload your first image!</p>
        </div>
      )}

      <AlertDialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file <span className="font-semibold">{fileToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};