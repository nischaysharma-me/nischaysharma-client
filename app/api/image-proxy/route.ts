import { NextRequest, NextResponse } from 'next/server';

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

const getAllowedStorageUrl = (value: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nischaysharma-com.firebasestorage.app';
    const allowedPrefix = `/${bucket}/users/`;
    if (url.protocol !== 'https:' || url.hostname !== 'storage.googleapis.com' || !url.pathname.startsWith(allowedPrefix)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const sourceUrl = getAllowedStorageUrl(request.nextUrl.searchParams.get('url'));
  if (!sourceUrl) {
    return NextResponse.json({ error: 'Only images from the configured Firebase Storage bucket are allowed' }, { status: 400 });
  }

  try {
    const source = await fetch(sourceUrl, { redirect: 'error', cache: 'no-store' });
    if (!source.ok) {
      return NextResponse.json({ error: 'The source image could not be downloaded' }, { status: source.status });
    }

    const contentType = source.headers.get('content-type')?.split(';')[0] || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'The source URL is not an image' }, { status: 415 });
    }

    const declaredLength = Number(source.headers.get('content-length') || 0);
    if (declaredLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'The image is larger than 25 MB' }, { status: 413 });
    }

    const image = await source.arrayBuffer();
    if (image.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'The image is larger than 25 MB' }, { status: 413 });
    }

    return new NextResponse(image, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(image.byteLength),
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'The source image could not be downloaded' }, { status: 502 });
  }
}
