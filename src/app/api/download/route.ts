import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function safeFilename(name: string) {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\r\n]/g, '')
    .trim() || 'download';
}

function contentDispositionFilename(name: string) {
  const asciiFallback =
    name
      .replace(/[\x00-\x1f\x7f-\xff]/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'download';

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');
  const filenameParam = request.nextUrl.searchParams.get('filename');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'image/*,video/*,audio/*,*/*',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file', status: response.status },
        { status: 502 }
      );
    }

    const fileBuffer = await response.arrayBuffer();

    const fallbackName =
      parsedUrl.pathname.split('/').pop() || 'media-file';

    const filename = safeFilename(
      filenameParam || decodeURIComponent(fallbackName)
    );

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileBuffer.byteLength),
        'Content-Disposition': contentDispositionFilename(filename),
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}