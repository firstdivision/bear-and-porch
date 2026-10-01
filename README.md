# Bear and Porch

A responsive React and TypeScript music site built with Vite. Album and Workshop audio lives in `public/media/`; track titles and paths are maintained in `src/music.ts`, and available lyrics from the legacy album and Workshop pages are in `src/lyrics.ts`. Tracks with lyrics have an expandable lyrics section.

## Local development

```sh
npm ci
npm run dev
```

Create and preview a production build with:

```sh
npm run build
npm run preview
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main` and on manual runs. In the repository's **Settings → Pages**, choose **GitHub Actions** as the deployment source. `public/CNAME` configures `bearandporch.com`; configure the domain's DNS with the domain provider and enable HTTPS in Pages after DNS is verified.

The selected legacy playlists and artwork are checked into `public/media/` and included in the Pages artifact. New media should be organized by collection, with corresponding typed track entries added to `src/music.ts`. Check GitHub's current file and Pages site size limits before adding more audio.
