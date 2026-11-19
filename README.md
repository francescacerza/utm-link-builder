# UTM Link Builder

A small, dependency-free tool to build clean and consistent UTM campaign links.
Everything runs in the browser: no sign-up, no server, no tracking.

**Live demo:** https://francescaericacerza-dotcom.github.io/utm-link-builder/

## Features

- Builds links with `utm_source`, `utm_medium`, `utm_campaign` (required) and `utm_term`, `utm_content` (optional)
- Optional cleanup of values (lowercase, spaces become hyphens) to keep reports consistent
- Keeps existing query parameters and `#fragments` in your URL
- Validates the URL and the required fields
- Copy to clipboard and a local history of the last 10 links (stored only in your browser)

## Usage

Open `index.html` in a browser, or use the live demo.

1. Enter the destination URL.
2. Fill in source, medium and campaign (suggestions are provided).
3. Click **Build link** and copy the result.

Example:

```
https://example.com/?utm_source=linkedin&utm_medium=social&utm_campaign=spring-launch
```

## Tests

The link-building logic is covered by a few Node tests (Node 18+):

```
node --test
```

## Deploy with GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`.
4. After a minute your site is live at `https://<username>.github.io/<repository>/`.
