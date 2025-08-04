import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { ZipReader, BlobReader, TextWriter, BlobWriter } from "https://deno.land/x/zipjs@v2.7.34/index.js";

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
    const zipReader = new ZipReader(new BlobReader(backupBlob));
    const entries = await zipReader.getEntries();

    // 1. Restore Database
    const dbEntry = entries.find(entry => entry.filename === 'database.json');
    if (!dbEntry || !dbEntry.getData) {
      throw new Error('database.json not found in backup file.');
    }
    const textWriter = new TextWriter();
    const dbJson = await dbEntry.getData(textWriter);
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
    const imageEntries = entries.filter(entry => entry.filename.startsWith('images/'));
    
    const { data: existingFiles, error: listError } = await supabase.storage.from(storageBucket).list('public');
    if (listError) throw new Error(`Could not list existing files for deletion: ${listError.message}`);
    if (existingFiles && existingFiles.length > 0) {
      const pathsToRemove = existingFiles.map(file => `public/${file.name}`);
      if (pathsToRemove.length > 0) {
        const { error: removeError } = await supabase.storage.from(storageBucket).remove(pathsToRemove);
        if (removeError) throw new Error(`Could not remove existing files: ${removeError.message}`);
      }
    }

    for (const entry of imageEntries) {
      if (!entry.getData) continue;
      const imageName = entry.filename.replace('images/', '');
      if (!imageName) continue;
      const blobWriter = new BlobWriter();
      const imageBlob = await entry.getData(blobWriter);
      const { error: uploadError } = await supabase.storage.from(storageBucket).upload(`public/${imageName}`, imageBlob, {
        upsert: true,
      });
      if (uploadError) {
        console.warn(`Failed to upload ${imageName}: ${uploadError.message}`);
      }
    }

    await zipReader.close();

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