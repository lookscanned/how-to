# Look Scanned How To

This is a repository for the how-to-use documentation used in the Look Scanned project, built with [VitePress](https://vitepress.dev/).

[![CI](https://github.com/lookscanned/how-to/actions/workflows/ci.yml/badge.svg)](https://github.com/lookscanned/how-to/actions/workflows/ci.yml)

[how-to.lookscanned.io](https://how-to.lookscanned.io)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Generate PDFs
pnpm run build:pdfs

# Build
pnpm build
```

## How to Add a New Language

1. Add a new markdown file to `docs/how-to-use/{lang-code}.md`
2. Add the language link to `docs/index.md`
3. If the language is RTL (Right-to-Left), add it to the `rtlLangs` array in `.vitepress/theme/Layout.vue`

## License

MIT License
