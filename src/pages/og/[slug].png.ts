import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { SITE } from '../../config';

type Card = {
  title: string;
  metric?: { value: string; label: string };
};

export const getStaticPaths = (async () => {
  const projects = await getCollection('projects');
  const cards: Record<string, Card> = {
    home: {
      title: `${SITE.jobTitle} at ${SITE.employer}`,
      metric: { value: '~1.5M', label: 'applications scored per month' },
    },
    projects: { title: 'Projects', metric: { value: '+10%', label: 'approval rate at constant risk' } },
    writing: { title: `Writing: ${SITE.substack.name}` },
  };
  for (const entry of projects) {
    cards[`project-${entry.id}`] = { title: entry.data.title, metric: entry.data.metric };
  }
  return Object.entries(cards).map(([slug, card]) => ({ params: { slug }, props: card }));
}) satisfies GetStaticPaths;

const fontDir = join(process.cwd(), 'node_modules', '@fontsource');
const font = (pkg: string, file: string) => readFile(join(fontDir, pkg, 'files', file));

const fonts = Promise.all([
  font('newsreader', 'newsreader-latin-400-normal.woff'),
  font('newsreader', 'newsreader-latin-500-normal.woff'),
  font('inter', 'inter-latin-400-normal.woff'),
  font('inter', 'inter-latin-500-normal.woff'),
]).then(([serif400, serif500, sans400, sans500]) => [
  { name: 'Newsreader', data: serif400, weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: serif500, weight: 500 as const, style: 'normal' as const },
  { name: 'Inter', data: sans400, weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: sans500, weight: 500 as const, style: 'normal' as const },
]);

const INK = '#1B1B1B';
const MUTED = '#6B6862';
const RULE = '#E4E0D8';
const ACCENT = '#1F4E3D';
const PAPER = '#FAF8F4';

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});

// Fontsource's latin subset has no arrow glyph, so spell it out.
const plain = (text: string) => text.replace(/\s*→\s*/g, ' to ');

export const GET: APIRoute = async ({ props }) => {
  const { title, metric } = props as Card;
  const long = title.length > 70;

  const tree = el(
    'div',
    {
      width: 1200,
      height: 630,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: PAPER,
      color: INK,
      fontFamily: 'Inter',
    },
    [
      el('div', { alignItems: 'baseline', justifyContent: 'space-between' }, [
        el('div', { fontFamily: 'Newsreader', fontWeight: 500, fontSize: 36 }, SITE.name),
        el(
          'div',
          { fontSize: 18, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: MUTED },
          `${SITE.jobTitle} · credit risk & GenAI`,
        ),
      ]),
      el(
        'div',
        {
          fontFamily: 'Newsreader',
          fontWeight: 500,
          fontSize: long ? 58 : 76,
          lineHeight: 1.1,
          letterSpacing: -1.5,
          maxWidth: 1000,
        },
        title,
      ),
      el('div', { alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${RULE}`, paddingTop: 32 }, [
        metric
          ? el('div', { alignItems: 'baseline', gap: 24 }, [
              el(
                'div',
                { fontFamily: 'Newsreader', fontSize: 64, lineHeight: 1, borderBottom: `3px solid ${ACCENT}`, paddingBottom: 8 },
                plain(metric.value),
              ),
              el('div', { fontSize: 26, color: MUTED, maxWidth: 520 }, metric.label),
            ])
          : el('div', { fontSize: 26, color: MUTED }, `${SITE.location} · ${SITE.employer}`),
        el('div', { fontSize: 22, fontWeight: 500, color: ACCENT }, 'esviswajith95.github.io'),
      ]),
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await fonts });
  const png = new Resvg(svg).render().asPng();

  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
