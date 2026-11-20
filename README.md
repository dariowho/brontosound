# Brontosound

Brontosound is a band management web app for record labels, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Developing

Once you've cloned this repo and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Admin password

The built-in `admin` user's password hash must be set as `adminPasswordHash` in `data/bandSettings.json`. Generate it with (then restart the server):

```bash
npm run -s hash-password
```

## Soundfonts

The Song page integrates a MIDI player. By default it runs baseline synthetized instruments. To download a real SoundFont:

```bash
npm run fetch-soundfont
```

## Building

To create a production version of Brontosound:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Releasing

```bash
npm run release
git push --follow-tags origin main
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Details: [docs/releasing.md](docs/releasing.md).

## Docker build

First build with `npm run build`

Build:

```bash
docker build . -t brontosound:latest
```

Run:

```bash
docker run --env-file .env -p 3888:3000 -e ORIGIN="http://localhost:3888" -v ./data:/app/data brontosound:latest
```

Debug:

```bash
docker run --env-file .env --rm -it --entrypoint bash brontosound:latest
```

Custom push:

```bash
docker save brontosound:latest | bzip2 | pv | ssh $USER@$HOST docker load
```
