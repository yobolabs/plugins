# App Format Reference (Slides Prototypes)

A Slides "app" (prototype) is a **single self-contained file** stored as raw text
in the `html` field. There is no Puck content, no component tree — just one blob
and a `language` tag.

## The single-file model

```json
{
  "id": "3a0420fa-c4bd-453b-91f6-1942c424d3d9",
  "name": "Pricing Calculator",
  "slug": "pricing-calculator",
  "language": "html",
  "html": "<!doctype html><html>…</html>",
  "status": "published",
  "publishedAt": "2024-06-01T12:00:00.000Z"
}
```

`html` is the entire source. `set-source` replaces it wholesale — there is no
partial-update for the blob.

## Language table

| language | Editor syntax | Served at `/proto/<slug>`? |
|----------|--------------|---------------------------|
| `html` | HTML | **YES** — served verbatim |
| `jsx` | JSX/React | **YES** — transformed in-browser |
| `css` | CSS | no (edit + export only) |
| `javascript` | JavaScript | no |
| `python` | Python | no |
| `json` | JSON | no |
| `sql` | SQL | no |

**Servable ⇔ language is `html` or `jsx`.** Calling `publish` on any other
language returns **422 INVALID_INPUT**. The `language` field is set at create
time and can be changed with `patch` — but changing a published app's language
to a non-servable one and calling `publish` again will fail until you change it
back.

## html mode

Write a complete, self-contained HTML document. All assets must be inline or
loaded from public CDNs — there is no build step, no asset pipeline. The file is
served verbatim.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Pricing Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 class="text-2xl font-bold p-8">Pricing Calculator</h1>
</body>
</html>
```

## jsx mode

Write a single `.jsx` file. The Slides runtime shells it with an in-browser
React + Babel transform (CDN React). The component exported as `default` is
mounted into the page.

```jsx
export default function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: 32 }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

**jsx mode constraints:**
- No `import` / `require` statements — CDN React is pre-injected globally.
- No module resolution — one file only.
- Runtime Babel transform: one syntax error breaks the entire app.
- No tree-shaking / dead-code elimination.

## Multi-file JSX projects

`jsx` mode is for simple widgets. For anything with multiple source files, shared
components, custom hooks, or heavy deps, **bundle to a single self-contained HTML
file first** and upload it as `language: "html"`. A bundle is exactly as robust
at runtime as the multi-file source — same app, packed — with none of the jsx
mode fragility.

**esbuild one-liner** (bundle a multi-file JSX entry to a single HTML):

```bash
# 1. Bundle JS to a self-contained IIFE (inline all deps + React)
npx esbuild src/index.jsx \
  --bundle \
  --format=iife \
  --loader:.jsx=jsx \
  --define:process.env.NODE_ENV='"production"' \
  --outfile=dist/bundle.js

# 2. Wrap in HTML (or use your own shell)
cat > dist/app.html <<'EOF'
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>My App</title></head>
<body>
  <div id="root"></div>
  <script>
EOF
cat dist/bundle.js >> dist/app.html
cat >> dist/app.html <<'EOF'
  </script>
</body>
</html>
EOF

# 3. Upload
app set-source <id> dist/app.html
```

For CSS-in-JS or Tailwind, add `--loader:.css=text` (inlines CSS as a string) or
use a Vite build (`vite build --outDir dist`) and copy the generated
`dist/index.html` (Vite inlines everything into one file by default).

Do **NOT** route a large multi-file app through `jsx` mode — in-browser Babel +
CDN React is fragile: runtime transform, no tree-shake, one syntax error breaks
everything.

## Slug rules

Slugs are `lowercase`, `digits`, and `hyphens` only — no underscores, no uppercase,
max 100 characters. Uniqueness is enforced per site (not per org), so the same slug
can exist in different sites. A duplicate slug within a site returns **409**.

When you don't pass a slug on create, one is derived from the name automatically.
