import { useState } from 'react';
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

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url" className="pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
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