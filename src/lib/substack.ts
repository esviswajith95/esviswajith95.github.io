import { readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { SITE } from '../config';

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  date: string;
  readingMinutes: number;
}

const CACHE = new URL('../data/writing.json', import.meta.url);
const WORDS_PER_MINUTE = 230;

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function parseFeed(xml: string): Post[] {
  const parser = new XMLParser({ ignoreAttributes: true, processEntities: true });
  const doc = parser.parse(xml);
  const items = toArray<Record<string, unknown>>(doc?.rss?.channel?.item);

  return items
    .map((item) => {
      const url = String(item.link ?? '');
      return {
        id: url.split('/p/')[1]?.replace(/\/$/, '') || url,
        title: String(item.title ?? '').trim(),
        subtitle: String(item.description ?? '').trim(),
        url,
        date: new Date(String(item.pubDate)).toISOString(),
        readingMinutes: readingMinutes(String(item['content:encoded'] ?? '')),
      };
    })
    .filter((post) => post.title && post.url)
    .sort((a, b) => b.date.localeCompare(a.date));
}

async function readCache(): Promise<Post[]> {
  try {
    return JSON.parse(await readFile(CACHE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Fetches the Substack feed at build time. A failed fetch must never fail the
 * build, so it falls back to the last cached copy in src/data/writing.json.
 */
export async function loadPosts(): Promise<Post[]> {
  try {
    const res = await fetch(SITE.substack.feed, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = parseFeed(await res.text());
    if (posts.length === 0) throw new Error('feed has no posts');

    const json = JSON.stringify(posts, null, 2) + '\n';
    const cached = await readFile(CACHE, 'utf8').catch(() => '');
    if (json !== cached) await writeFile(CACHE, json);
    return posts;
  } catch (error) {
    console.warn(`[writing] Substack feed unavailable (${(error as Error).message}); using cached posts.`);
    return readCache();
  }
}
