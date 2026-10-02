# Bear and Porch

A responsive, dark, Winamp-inspired music site for Bear and Porch. It is a client-side React application built with TypeScript and Vite, deployed to GitHub Pages at [bearandporch.com](https://bearandporch.com/).

The site provides four music collections: Stiff Drink, The Great Escape, Project Blue, and Workshop. Visitors can browse tracks, build and edit a playlist, play songs in the fixed player dock, view available lyrics, and follow the band's Spotify and YouTube pages. It intentionally does not include bios, contact information, or purchase links.

## Features and behavior

- Responsive collection browsing and player controls, including mobile layouts.
- Tracks can be added individually or as a whole collection. Selecting a track in the library adds it to the queue; it starts immediately only if the queue was empty. Adding more tracks does not interrupt playback.
- The explicit Play control on a queued track switches playback to that track. Selecting **Play Collection** replaces the queue with that collection and starts its first track.
- The player dock provides play/pause, previous/next, seeking, and a lyrics control that is disabled when the current track has no lyrics.
- Lyrics are displayed in a drawer and keyed by track ID.
- On browsers with Media Session support, the app publishes the current track, artist, album, square cover-art variants, and play/pause/previous/next handlers for lock-screen and system media controls.
- On most browsers, the EQ reads live frequency data through the Web Audio API. On iPhone and iPad, playback stays on the native HTML audio path to support background playback; the visualizer uses a CSS animation there instead.

## How it is organized

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Player UI, playlist behavior, HTML audio, EQ, lyrics, and Media Session integration |
| `src/music.ts` | Typed collection and track catalog, including media paths and artwork |
| `src/lyrics.ts` | Lyrics indexed by track ID (`collection-id:track-id`) |
| `src/winamp.css` | Player styling, responsive layouts, and visualizer animations |
| `public/media/<collection>/` | MP3s copied to the site unchanged during the Vite build |
| `public/media/artwork/` | Collection covers, social preview, and lock-screen cover variants |
| `.github/workflows/deploy.yml` | GitHub Actions build and Pages deployment |

The collection catalog is the source of truth for the track lists and collection counts shown in the UI. Track IDs must be unique; the `makeTrack` helper builds them from the collection ID and track-specific ID.

### Adding audio, lyrics, or artwork

1. Put MP3 files in the appropriate folder under `public/media/`.
2. Add or update the collection and track entries in `src/music.ts`. The `src` path is a root-relative public path such as `/media/workshop/new-song.mp3`.
3. To add lyrics, add an entry in `src/lyrics.ts` keyed by the exact track ID, for example `workshop:new-song`.
4. To provide collection artwork, add a cover under `public/media/artwork/` and set the collection's `artwork` path in `src/music.ts`.
5. For lock-screen artwork, add **both** square JPEG variants to `public/media/artwork/lockscreen/`. Their names must match the cover filename (without its extension), followed by `-512.jpg` and `-96.jpg`. For example, `workshop.jpg` requires `workshop-512.jpg` and `workshop-96.jpg`. The app derives these paths from the collection artwork filename and advertises both dimensions in Media Session metadata.

Collections without an `artwork` path have no lock-screen cover image. Keep the artwork variants square and verify their URLs return `image/jpeg` after building. The small variant is included to help compact lock-screen displays; actual image selection and presentation are controlled by the browser and operating system.

## Local development

Use Node.js 20 (the same major version as the deployment workflow) and npm:

```sh
npm ci
npm run dev
```

Vite prints the local development URL. For a production build and local preview:

```sh
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build before creating the Vite production bundle in `dist/`.

## Playback and browser gotchas

- **Playback needs a user gesture.** Mobile browsers may reject audio playback started without a tap or click. The app starts audio from player or collection interactions and displays an error if playback fails.
- **iOS playback deliberately avoids routing audio through Web Audio.** Creating a `MediaElementAudioSourceNode` can make background playback less reliable on iOS. The live analyser is therefore used on other browsers, while iPhone/iPad use native audio playback and a CSS-animated EQ.
- **Lock-screen UI is platform-controlled.** Media Session metadata and artwork are supplied where the API is available, but the browser/OS decides when and how to show them. The site has been browser-checked for metadata and valid artwork URLs; this does not guarantee identical behavior on every iOS version or device.
- **Private Safari observation:** during device testing, playback and lock-screen transport controls worked in a Private Browsing tab, but track details and artwork were blank. The deployed site contained the metadata code and artwork files. Private Browsing was the observed difference, but this has not been established as a general Safari limitation; compare a regular Safari tab on the same iPhone and iOS version when troubleshooting.
- **Artwork filenames are part of the metadata contract.** The generated lock-screen URLs use the basename of a collection's `artwork` path, so keep the `-512.jpg` and `-96.jpg` files in sync with that basename.
- **Media is checked into the repository.** MP3s and artwork are copied into the Pages artifact; they are not streamed from an external service. Check GitHub's current repository and Pages size limits before adding substantial media.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` runs on pushes to `main` and on manual dispatch. It checks out the repository, installs locked dependencies with `npm ci`, builds the site, uploads `dist/`, and deploys the Pages artifact. In repository **Settings → Pages**, select **GitHub Actions** as the build and deployment source.

`public/CNAME` configures the custom domain `bearandporch.com`. Configure the apex DNS at the domain registrar to point to GitHub Pages using GitHub's published Pages IP addresses, and enable HTTPS in the Pages settings once DNS verification succeeds. If changing the domain or DNS provider, follow GitHub's current custom-domain guidance and verify both DNS and HTTPS status in Pages.

## Verification checklist

Before publishing a change:

1. Run `npm run build`.
2. Check `git diff --check`.
3. For new media, confirm its path and filename match `src/music.ts` and that the resulting file is present in `dist/`.
4. For Media Session artwork, test both variant URLs and, when possible, test playback on the target device in regular Safari as well as any private browsing mode being used.
