import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { BlobReader, BlobWriter, ZipWriter } from "https://deno.land/x/zipjs@v2.7.34/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const tablesToBackup = [
  'settings',
  'categories',
  'posts',
  'comments',
  'post_categories',
];

const storageBucket = 'post-images';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

    // 1. Backup database tables
    const dbBackup: { [key: string]: any[] } = {};
    for (const table of tablesToBackup) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw new Error(`Error fetching table ${table}: ${error.message}`);
      dbBackup[table] = data;
    }
    
    const dbBlob = new Blob([JSON.stringify(dbBackup, null, 2)], { type: 'application/json' });
    await zipWriter.add("database.json", new BlobReader(dbBlob));

    // 2. Backup storage files
    const { data: fileList, error: listError } = await supabase.storage.from(storageBucket).list('public', {
      limit: 10000
    });

    if (listError) throw new Error(`Error listing storage files: ${listError.message}`);

    if (fileList) {
      for (const file of fileList) {
        const { data: fileData, error: downloadError } = await supabase.storage.from(storageBucket).download(`public/${file.name}`);
        if (downloadError) {
          console.warn(`Could not download ${file.name}, skipping. Error: ${downloadError.message}`);
          continue;
        }
        if (fileData) {
          await zipWriter.add(`images/${file.name}`, new BlobReader(fileData));
        }
      }
    }

    // 3. Finalize zip
    const zipBlob = await zipWriter.close();

    return new Response(zipBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'application/zip' },
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