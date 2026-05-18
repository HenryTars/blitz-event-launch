import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const { error } = await supabase.storage
      .from('events')
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (error) {
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        return NextResponse.json({
          error: 'Storage bucket "events" does not exist. Create it in your Supabase dashboard under Storage > New Bucket (public bucket, name: "events").'
        }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
