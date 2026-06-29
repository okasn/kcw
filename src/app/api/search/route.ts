import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { NextResponse } from 'next/server';

type SearchMessage = {
  id: string;
  createdAt: string;
  text: string;
  replyText: string;
  searchText: string;
  chatHref: string;
};

const getSearchIndex = cache(async (): Promise<SearchMessage[]> => {
  const filePath = path.join(
    process.cwd(),
    'public',
    'data',
    'search-index.json'
  );

  const raw = await fs.readFile(filePath, 'utf8');

  return JSON.parse(raw) as SearchMessage[];
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ messages: [] });
  }

  const index = await getSearchIndex();

  const messages = index
    .filter((msg) => msg.searchText.toLowerCase().includes(q))

  return NextResponse.json({ messages });
}