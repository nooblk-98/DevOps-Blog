import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImageToSupabase } from '@/utils/storage';
import { showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

interface StorageFile {
  name: string;
  id: string;
  publicUrl: string;
  path: string;
  created_at: string;
}

const MediaLibraryTab = ({ onInsert, onClose, isOpen }: { onInsert: (url: string) => void, onClose: () => void, isOpen: boolean }) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      const [rootList, publicList] = await Promise.all([
        supabase.storage.from('post-images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } }),
        supabase.storage.from('post-images').list('public', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      ]);

      if (rootList.error || publicList.error) {
        showError('Failed to fetch media files.');
        console.error(rootList.error || publicList.error);
      } else {
        const fileMap = new Map<string, StorageFile>();

        const processFiles = (files: any[], prefix = '') => {
          files
            .filter((file: any) => file.id !== null)
            .forEach((file: any) => {
              const path = `${prefix}${file.name}`;
              const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
              fileMap.set(path, { ...file, publicUrl, path });
            });
        };

        processFiles(rootList.data || []);
        processFiles(publicList.data || [], 'public/');
        
        const allFiles = Array.from(fileMap.values()).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setFiles(allFiles);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  return (
    <div className="py-4">
      <ScrollArea className="h-72">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pr-4">
          {loading ? (
            [...Array(12)].map((_, i) => <Skeleton key={i} className="w-full h-24" />)
          ) : (
            files.map(file => (
              <button
                key={file.id}
                className="relative aspect-square overflow-hidden rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => onInsert(file.publicUrl)}
              >
                <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" />
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </div>
  );
};

export const ImageUploadDialog = ({ isOpen, onClose, onInsert }: ImageUploadDialogProps) => {
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInsertFromUrl = () => {
    if (url) {
      onInsert(url);
      onClose();
      setUrl('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const imageUrl = await uploadImageToSupabase(file);
    setIsUploading(false);

    if (imageUrl) {
      onInsert(imageUrl);
      onClose();
    } else {
      showError('Upload failed. Please try again.');
    }
  };

  const handleSelectFromLibrary = (imageUrl: string) => {
    onInsert(imageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="library" className="pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="library">
            <MediaLibraryTab onInsert={handleSelectFromLibrary} onClose={onClose} isOpen={isOpen} />
          </TabsContent>
          <TabsContent value="url">
            <div className="py-4 space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleInsertFromUrl}>Insert Image</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="upload">
            <div className="py-4 space-y-4">
              <Label htmlFor="imageUpload">Choose an image to upload</Label>
              <Input id="imageUpload" type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
              {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>
             <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};