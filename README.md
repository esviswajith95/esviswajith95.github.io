# esviswajith95.github.io

Personal site of Viswajith E S, Senior Data Scientist (credit risk and GenAI for lenders).
Built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview
```

## Updating content

| To change | Edit |
| --- | --- |
| A project write-up | `src/content/projects/*.mdx` (one file per project; `order` sets its position) |
| The CV | Replace `public/Viswajith_ES_Resume.pdf`, then update `src/data/resume.yaml` and its `updated` date |
| Home (résumé) and Projects | `src/data/resume.yaml` feeds both: `summary` is the home summary, `skills` are the home skill chips, `experience.groups` are the project bullets |
| NFC landing page | `src/pages/connect.astro` (served at `/connect/`, not indexed) |
| Name, links, positioning line, analytics | `src/config.ts` |
| Writing | Publish on Substack. The feed is pulled at build time, and a daily scheduled build picks up new posts |

`src/data/writing.json` is the cached copy of the Substack feed. If the feed can't be fetched, the build uses this
file instead of failing. It is refreshed whenever a local build succeeds in fetching the feed.

The phone number lives only inside the PDF. Don't add it to `resume.yaml` or any page.

## Deploy

`.github/workflows/deploy.yml` builds on every push to `main`, once a day, and on manual dispatch.
In the repo settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
