import { readFile } from 'node:fs/promises';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { loadPosts } from './lib/substack';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    description: z.string(),
    problem: z.string(),
    outcome: z.string(),
    sector: z.string(),
    role: z.string(),
    period: z.string(),
    year: z.string(),
    stack: z.array(z.string()),
    tags: z.array(z.string()),
    metric: z.object({ value: z.string(), label: z.string() }),
  }),
});

const writing = defineCollection({
  loader: loadPosts,
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    url: z.url(),
    date: z.coerce.date(),
    readingMinutes: z.number(),
  }),
});

const resume = defineCollection({
  loader: async () => {
    const data = parse(await readFile('./src/data/resume.yaml', 'utf8'));
    return [{ id: 'resume', ...data }];
  },
  schema: z.object({
    name: z.string(),
    title: z.string(),
    location: z.string(),
    email: z.email(),
    updated: z.coerce.date(),
    summary: z.array(z.string()),
    experience: z.array(
      z.object({
        company: z.string(),
        context: z.string(),
        roles: z.array(z.object({ title: z.string(), period: z.string() })),
        highlights: z.array(z.string()),
        groups: z.array(z.object({ name: z.string(), items: z.array(z.string()) })),
      }),
    ),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
    education: z.array(
      z.object({ degree: z.string(), institution: z.string(), score: z.string(), period: z.string() }),
    ),
    honours: z.array(z.string()),
  }),
});

export const collections = { projects, writing, resume };
