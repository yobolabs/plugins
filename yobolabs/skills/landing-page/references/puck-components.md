# Puck Content Model & Component Catalog

The landing-page body is **Puck** page JSON, stored in the microsite's `content`
field. To change a page's layout/copy you rewrite `content` and PATCH it back.
This file is the authoritative reference for that JSON.

## Content shape

`content` is always this object (verified against live pages):

```json
{
  "root": { "props": {} },
  "content": [ /* ordered top-level components */ ],
  "zones": { /* nested-component slots, keyed by "<parentId>:<slot>" */ }
}
```

- `root.props` — page-level props (usually `{}`).
- `content[]` — the **ordered** list of top-level components. Render order = array order.
- `zones` — children of layout components (Container/Card/Columns). Empty `{}` for flat pages.

### A component entry

Every entry in `content[]` (and inside zones) is:

```json
{ "type": "Heading", "props": { "id": "Heading-<uuid>", "...": "..." } }
```

- **`type`** — the component name (exactly as in the catalog below, PascalCase).
- **`props.id`** — REQUIRED and MUST be unique across the whole page, in the
  format `"<Type>-<uuid>"`, e.g. `"Heading-4293accc-772b-4ef7-aa2e-4ab4ed0581e1"`.
  Use the helper: `node lp.mjs new-id Heading`. **A missing or duplicate `id`
  breaks the editor.**
- Remaining props are component-specific (see catalog). Omitted props fall back
  to the component's defaults.

## ⚠️ Critical gotchas

1. **`id` is mandatory** on every component, format `<Type>-<uuid>`, unique per page.
2. **Heading uses `text`; Text uses `content`.** Don't swap them. (`Heading.text`, `Text.content`.)
3. **PATCH `content` replaces the whole page body.** Always GET current content,
   mutate the array, then PATCH the *entire* object back — never send a partial.
4. **Numeric-ish props are strings**, not numbers: `"fontSize": "40"`, `"level": "h2"`.
   (Exception: `padding` on Container/Card is an object of numbers — see below.)
5. **Nesting goes in `zones`, not inline.** Layout components (Container, Card,
   Columns) hold children in zones, not in their own props. For simple pages,
   keep everything flat in `content[]` and skip zones entirely.

## Two ways to build a section

- **Structured components** (Heading, Text, Button, Image, …) — clean, field-driven,
  best for standard content. Use these by default.
- **CustomCode** — an escape hatch holding raw `html` / `css` / `js`. Use for
  pixel-perfect/animated/marketing sections that don't map to a component. The
  boost-global landing sections were all built this way. Prefer structured
  components when they fit; reach for CustomCode for bespoke sections.

### CustomCode example

```json
{
  "type": "CustomCode",
  "props": {
    "id": "CustomCode-1f0a…",
    "html": "<section class=\"hero\"><h1>Big launch</h1><p>Sub copy</p></section>",
    "css": ".hero{padding:64px;text-align:center}.hero h1{font-size:48px}",
    "js": "",
    "backgroundColor": "transparent",
    "minHeight": "auto",
    "maxWidth": "full",
    "borderRadius": "0",
    "overflow": "hidden"
  }
}
```

## Component catalog

PascalCase `type` values, grouped by the editor's categories. Key props listed;
all also take an `id`. Strings unless noted.

### Layout (hold children in `zones`)
| type | purpose | key props |
|------|---------|-----------|
| `Container` | section wrapper / band | `backgroundColor`, `backgroundImage`, `backgroundGradient`, `padding`{top,right,bottom,left:number}, `maxWidth`, `minHeight`, `borderRadius`, `verticalAlign`, `horizontalAlign`, `shadow`, `htmlId`, `children`(slot) |
| `Columns` | multi-column row | `columns`("1"–"4"), `gap`, `verticalAlign`, `stackOnMobile`, `reverseOnMobile`, `column1`…`column4`(slots) |
| `Card` | bordered card | `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`, `shadow`, `padding`{…}, `hoverBorderColor`, `children`(slot) |
| `Spacer` | vertical space / divider | `height`, `showDivider`, `dividerColor`, `dividerWidth`, `dividerStyle` |

### Content
| type | purpose | key props |
|------|---------|-----------|
| `Heading` | heading | **`text`**, `level`("h1"–"h6"), `color`, `fontFamily`, `fontSize`, `fontWeight`, `textAlign`, `letterSpacing`, `lineHeight`, `marginBottom` |
| `SplitHeading` | two-tone heading | `textLead`, `textTrail`, `separator`("space"/"newline"), `level`, `colorLead`, `colorTrail`, `fontFamily`, `fontSize`, `fontWeight`, `textAlign`, `letterSpacing`, `lineHeight`, `marginBottom` |
| `Text` | paragraph | **`content`**, `color`, `fontFamily`, `fontSize`, `fontWeight`, `textAlign`, `lineHeight`, `marginBottom` |
| `Image` | image | `src`, `alt`, `width`, `aspectRatio`, `objectFit`, `borderRadius`, `shadow`, `marginBottom`, `hoverZoom` |
| `Button` | CTA button | `label`, `url`, `backgroundColor`, `textColor`, `fontSize`, `fontWeight`, `paddingX`, `paddingY`, `borderRadius`, `borderWidth`, `borderColor`, `fullWidth`, `align`, `marginBottom`, `animate` |
| `Badge` | pill/label | `text`, `backgroundColor`, `textColor`, `borderColor`, `fontSize`, `fontWeight`, `paddingX`, `paddingY`, `borderRadius`, `align`, `marginBottom` |
| `Icon` | icon | `icon`, `size`, `color`, `backgroundColor`, `backgroundPadding`, `backgroundRadius`, `marginBottom` |

### Interactive
| type | purpose | key props |
|------|---------|-----------|
| `Accordion` | FAQ accordion | `items`(array), `backgroundColor`, `textColor`, `borderColor`, `questionSize`, `answerSize`, `iconColor`, `padding` |
| `Form` | lead/contact form | `fields`(array), `buttonLabel`, `buttonBgColor`, `buttonTextColor`, `inputBgColor`, `inputBorderColor`, `inputTextColor`, `labelColor`, `maxWidth`, `successMessage`, `marginBottom` |
| `VideoEmbed` | video | `videoUrl`, `posterImage`, `aspectRatio`, `borderRadius`, `shadow`, `autoplay`, `controls`, `loop`, `marginBottom` |
| `CounterAnimation` | animated stats | `items`(array), `textColor`, `accentColor`, `labelColor`, `fontSize`, `layout`, `gap`, `duration`, `separator`, `separatorColor` |
| `ChatEmulator` | fake chat demo | `messages`(array of {role,text}), `botName`, `botAvatar`, `showHeader`, `headerColor`, `backgroundColor`, `userBubbleColor`, `botBubbleColor`, `typingSpeed`, `delayBetween`, `height`, `autoplay`, `loop` |

### Commerce / Marketing
| type | purpose | key props |
|------|---------|-----------|
| `ProductsGrid` | product cards | `title`, `categoryFilter`, `maxItems`, `columns`, `gap`, `cardBgColor`, `cardBorderColor`, `cardBorderRadius`, `titleColor`, `priceColor`, `imageAspectRatio`, `maxWidth`, `products`(array) |
| `OfferBanner` | promo banner | `title`, `offerDescription`, `expiryDate`, `backgroundColor`, `textColor`, `badgeBgColor`, `badgeTextColor`, `padding`, `borderRadius`, `offerData` |
| `StatsBar` | stat row | `stats`(array), `backgroundColor`, `textColor`, `accentColor`, `padding`, `columns`, `borderColor`, `showDividers` |
| `Testimonial` | quote/review | `quote`, `authorName`, `authorRole`, `authorImage`, `rating`, `starColor`, `backgroundColor`, `textColor`, `borderColor`, `borderRadius`, `padding` |
| `LogoCarousel` | scrolling logos | `logos`(array), `speed`, `backgroundColor`, `padding`, `logoHeight`, `gap`, `pauseOnHover`, `grayscale` |

### Navigation
| type | purpose | key props |
|------|---------|-----------|
| `NavBar` | top nav | `logoUrl`, `logoAlt`, `logoHeight`, `links`(array), `ctaLabel`, `ctaUrl`, `backgroundColor`, `textColor`, `ctaBackgroundColor`, `ctaTextColor`, `sticky`, `padding` |

### Advanced
| type | purpose | key props |
|------|---------|-----------|
| `CustomCode` | raw HTML/CSS/JS | `html`, `css`, `js`, `backgroundColor`, `minHeight`, `maxWidth`, `borderRadius`, `overflow` |

> The catalog is the source of truth as of writing. If a prop isn't rendering,
> GET a page that already uses that component in the editor and copy its exact
> prop shape — the running app's output is the ultimate ground truth.

## Nesting with zones (advanced)

To put components inside a Container/Card/Columns, the parent stays in `content[]`
(or its own zone) and its children live in `zones` under a key
`"<parentId>:<slot>"`. Slot names: Container/Card → `children`; Columns →
`column1`…`column4`.

```json
{
  "root": { "props": {} },
  "content": [ { "type": "Container", "props": { "id": "Container-aaa", "maxWidth": "1200" } } ],
  "zones": {
    "Container-aaa:children": [
      { "type": "Heading", "props": { "id": "Heading-bbb", "text": "Inside the container", "level": "h2", "fontSize": "40" } },
      { "type": "Text", "props": { "id": "Text-ccc", "content": "Nested paragraph." } }
    ]
  }
}
```

Keep pages **flat** unless you specifically need columns/cards — flat `content[]`
is simpler and less error-prone.

## Full worked example (flat page)

```json
{
  "root": { "props": {} },
  "zones": {},
  "content": [
    {
      "type": "Heading",
      "props": {
        "id": "Heading-11111111-1111-1111-1111-111111111111",
        "text": "Launch your store in minutes",
        "level": "h1",
        "color": "#0f172a",
        "fontSize": "56",
        "fontWeight": "extrabold",
        "textAlign": "center",
        "lineHeight": "tight",
        "marginBottom": "16"
      }
    },
    {
      "type": "Text",
      "props": {
        "id": "Text-22222222-2222-2222-2222-222222222222",
        "content": "Everything you need to sell online, beautifully.",
        "color": "#475569",
        "fontSize": "18",
        "textAlign": "center",
        "marginBottom": "24"
      }
    },
    {
      "type": "Button",
      "props": {
        "id": "Button-33333333-3333-3333-3333-333333333333",
        "label": "Get started",
        "url": "https://example.com/signup",
        "backgroundColor": "#2563eb",
        "textColor": "#ffffff",
        "align": "center",
        "borderRadius": "8"
      }
    }
  ]
}
```
