import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function safeFilename(name: string) {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\r\n]/g, '')
    .trim();
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');
  const filenameParam = request.nextUrl.searchParams.get('filename');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing url' },
      { status: 400 }
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid url' },
      { status: 400 }
    );
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: 'Invalid protocol' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 502 }
      );
    }

    const fallbackName =
      parsedUrl.pathname.split('/').pop() || 'media-file';

    const filename = safeFilename(
      filenameParam || decodeURIComponent(fallbackName)
    );

    const contentType =
      response.headers.get('content-type') ||
      'application/octet-stream';

    const contentLength =
      response.headers.get('content-length');

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        ...(contentLength
          ? { 'Content-Length': contentLength }
          : {}),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}