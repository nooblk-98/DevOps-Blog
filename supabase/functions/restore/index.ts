import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { unzip } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const storageBucket = 'post-images';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const backupBlob = await req.blob();
    const backupData = new Uint8Array(await backupBlob.arrayBuffer());
    const files = await unzip(backupData);

    // 1. Restore Database
    const dbEntry = files['database.json'];
    if (!dbEntry) {
      throw new Error('database.json not found in backup file.');
    }
    const dbJson = new TextDecoder().decode(dbEntry);
    const dbData = JSON.parse(dbJson);

    const rpcParams = {
      settings_data: dbData.settings || [],
      categories_data: dbData.categories || [],
      posts_data: dbData.posts || [],
      comments_data: dbData.comments || [],
      post_categories_data: dbData.post_categories || [],
    };

    const { error: rpcError } = await supabase.rpc('restore_data', rpcParams);
    if (rpcError) {
      throw new Error(`Database restore failed: ${rpcError.message}`);
    }

    // 2. Restore Images
    const { data: existingFiles, error: listError } = await supabase.storage.from(storageBucket).list('public');
    if (listError) throw new Error(`Could not list existing files for deletion: ${listError.message}`);
    if (existingFiles && existingFiles.length > 0) {
      const pathsToRemove = existingFiles.map(file => `public/${file.name}`);
      if (pathsToRemove.length > 0) {
        const { error: removeError } = await supabase.storage.from(storageBucket).remove(pathsToRemove);
        if (removeError) throw new Error(`Could not remove existing files: ${removeError.message}`);
      }
    }

    for (const filePath in files) {
      if (filePath.startsWith('images/')) {
        const imageName = filePath.replace('images/', '');
        if (!imageName) continue;
        
        const imageBlob = new Blob([files[filePath]]);
        const { error: uploadError } = await supabase.storage.from(storageBucket).upload(`public/${imageName}`, imageBlob, {
          upsert: true,
        });
        if (uploadError) {
          console.warn(`Failed to upload ${imageName}: ${uploadError.message}`);
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Restore successful' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})