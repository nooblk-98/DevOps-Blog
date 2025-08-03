import { supabase } from '@/lib/supabase';
import { showLoading, showError, dismissToast } from '@/utils/toast';

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  const toastId = showLoading('Uploading image...');

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);
    
    dismissToast(toastId);
    return data.publicUrl;
  } catch (error: any) {
    dismissToast(toastId);
    showError(error.message || 'Failed to upload image.');
    console.error('Error uploading image:', error);
    return null;
  }
};