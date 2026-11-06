# Fast path: "Just swap the product"

Back to [SKILL.md](../SKILL.md). Read when the merchant picks "Just swap the product", when a template is re-run for a
new product, or when deciding whether a swap is allowed. Principles: P4 (reuse first, pay once) and P5 (the
merchant's product, true to life). The full storyboard pipeline stays the default; never pick this path for the
merchant.

## The fast path

**"Just swap the product" (merchant's choice, Sean 2026-11-03 ~20:2x: "Yes, let's add that. So that
would basically bypass a whole bunch of things."; YMS-705, p132 §15).** When the merchant picks it, steps 2-7 are
skipped. A product swap ALWAYS keeps the ad's own scenes without the product and remakes only the product scenes
(Sean 2026-11-04: "It should be default if you're just swapping the product … There should be no option to turn that
off"); see "Every finished video becomes a template" below for the parts. Each remade part is a Seedance 2.0
reference-to-video call with `video_urls=[that part]` + `image_urls=[the product sheet]`, 480p draft. The prompt
binds the inputs with @ tags first (`@Video1` = the part: people, place, camera, timing, never looks · `@Image1` =
<name> as a product sheet: looks and packaging, never framing), then says "Recreate @Video1 exactly … only change: the
advertised product becomes @Image1 (<name>), label exact. No text on screen." + the size rule + the template-prompt
rule (`types/template-reel.md`). Every mention uses the tag (`content-creation:higgsfield-video` § 2, rule 8); a panel script's own
`@Image1` then means our product. **The product sheet comes first, even on
a swap** (Sean 2026-11-04: "create a character sheet even if it's a product swap … the side view is not clear"):
one turnaround picture (front, three-quarter, side, back) from all the product's photos, shown for OK, then sent as the
product image. One photo shows one side; the model invents the rest. Then review → export → post as usual.
Inputs must come from fast storage (Cadra / S3 presigned): a slow public link failed with "Downloading an input file
timed out". The full pipeline stays the default; never pick the fast path for the merchant.

- **Swap only when the product is shown as itself** (Sean 2026-11-04: "product swap is not so straightforward for
  many cases … when the product appears not clearly … on reflections or on pages … use our normal process with
  storyboards"). After the reading, check every product appearance: the product held, placed or shown as an object =
  swap is fine; printed on pages, flyers, posters or clothes, shown on a screen, in a reflection, or tiny/blurred =
  NO swap. Say why in one line and use the storyboard pipeline. Seedance copies printed art from the reference video
  whatever the prompt says.
- **Spend the fewest paid seconds** (Sean 2026-11-04: "make sure that we're using the clipped version and we can save
  money on generation"): send each remade part CLIPPED to the ad area at a standard size; a remade part that ends on a
  held frame is split into video for the moving seconds + ONE picture for the held tail; make held pictures FIRST and
  pass the first one to the video parts as a second image for any printed art they share. Show the plan (kept / video
  seconds / pictures) before anything is paid.
- **Text is removed from the source by default** (Sean 2026-11-04: "it ended up showing some weird text at the top. We
  should remove text by default"). Overlay text in the reference video (captions, view counts, handles, watermarks,
  QR codes) is found and blurred out BEFORE any model call; telling the model "no text" is not enough (a "1.1M Views"
  overlay came back as garbled letters). Text comes back only when the prompt asks for it (e.g. a flyer's words); real
  logos and captions are added in post, never drawn by the model (it wrote "CHICKENN" on a box).
- **Use one ad out of a compilation.** Cut the source to the one ad first (the lab's "Use only from … to …"), never
  run a compilation as a whole: it bills every product scene of every ad in it.
- **Spell out every text change.** A long edited script in the prompt is not enough: compare it with the original and
  list each change as `"OLD" becomes "NEW"` in every video and picture prompt (a poster kept "SAVE THE DATE" when the
  change sat only inside the script).
- **Product sheet views follow the shape.** A round product (cup, tub, can, bottle, jar) has no front or back: ask for
  top-down, high three-quarter, side and base, every view different. Boxy products: front, three-quarter, side, back.
  A faulty sheet is fixed by EDITING the last try with notes ("Image 1 = last try … change only: <notes>"), never a
  blind redo. Photos go in as flattened JPEGs (long side 1024–2048 px): a tiny transparent PNG made Higgsfield fail
  "We could not prepare the media for generation". A plated dish has no packaging: name it as plated food ("<dish> on a
  round white plate, food on a plate, no box") and ask for plate views; a menu-item name alone drew a branded takeout
  box. A defect that survives one edit → "Don't use it", fix the name or notes, fresh draw (an edit keeps its input).

- **Real size, always** (Sean 2026-11-04: "One of the key things we need to do is make sure the dimensions are
  correct"). Ask the product's real size (e.g. "500 ml can, 17 cm tall") before any paid call; every swap prompt
  (video and picture) says: show it at its real-world size and proportions next to people, hands and objects, never
  scaled to the product it replaces; change how it is held or placed instead. Without it a small tub came out the
  size of the bag it replaced.
  Exception: a template whose concept is deliberately giant (e.g. a CGI "giant product launches like a rocket" ad) is
  marked `scale: hero` on the template; only then do swap prompts skip the real-size line (arch-5 2026-11-05,
  template 15b938a1). Accidental mis-scaling is always a fail.
- **Swap only when ONE thing changes: the product** (Sean 2026-11-04: "it's actually better to run it as a normal
  storyboard … because we have more than just a product image involved"). If the remix must also change what goes
  into the product (ingredients, a recipe), its packaging AND its contents, or several different items, use the
  storyboard pipeline: each changed scene gets its own approved picture. One video call cannot hold several changes:
  a making-of box ad kept the cookie ingredients when the box was swapped (01a1a5a4), and kept the cookie box when the
  ingredients were swapped (01a1a5b0). The recipe rule for making-of ads: `types/product-hero.md` "A making-of ad needs a real recipe".
- **Swap only within the same product type** (Sean 2026-11-04: "where the product is not the same type, for example
  a beauty product versus food or a pet … it doesn't translate well"). Food/drink, beauty/personal care, pet, fashion,
  tech and home products are used, held and shown differently; a swap keeps the original's actions, so a cross-type
  swap looks wrong. Different type → no swap: pick an ad of the same type, or use the storyboard pipeline. The lab
  (v8.89+) blocks a clear mismatch; when it cannot tell, you decide from the reading and say which type each side is.


## Templates, reuse and source download

**A template = the finished run's configuration + its variables** (Sean 2026-11-06: "what are the variables that can
be changed from that configuration, and that's basically what the template is"). The configuration is everything the
run settled: cut list and timings, beats, the ad's music, keep vs remake per scene, still vs moving per scene, the
ad-area crop and overlay-text blur, the line drawings, the kept clips, and each remade part's prompt, plus every lab setting: use the ad's own audio, send the
ad's own shot as the reference, each scene's type (still / motion / keep the ad's clip / merchant's own clip, with in
and out), video and picture model, quality, shape, look, exact timings, on-screen text layers (Sean 2026-11-06:
"using the ad's own audio, using the ad's own video for certain parts"). Full field list = the lab port list
(`slides/_specs/p130-video-ux-cleanup/flow/remix-lab/ADSTUDIO-PORT.md` in the Remix KB): tag each field FIXED or
VARIABLE, drop none. The variables
are the slots a new merchant fills: product (sheet, real size, type), cast, set and look, text changes ("OLD" becomes
"NEW"), offer, caption, language, and which scenes they choose to remake. Save the configuration frozen and the
variables as named slots with defaults; a rerun fills slots only. The template is what the agent follows (Sean 2026-11-06: "the templates will be your
prompt that the agent knows how to proceed. It will know what to set, it will know what to do"): the template
reaches the agent as a tool result listing each variable with its question and default; code applies the fixed
configuration, the agent only asks for and fills the variables. Each variable is filled in this order (Sean 2026-11-06: "is this something I could go find
myself … is there something I can suggest? Or is it something that I need approval or need an idea … from the
user and I'll give them some choices"): FIND it in the catalog, Business DNA or earlier remixes; else SUGGEST
1–3 candidates ("Use this?"); else ASK with 2–3 choices plus "Keep as the template". Offer, price and claims are
never taken from the template. Harm if not: the merchant is asked for things we already have. Harm if not: every rerun re-reads the ad and re-asks
choices already settled, costing time and paid calls, and two runs of one template drift apart.

**Every finished video becomes a template** (Sean 2026-11-03 ~21:2x: "Basically, every video created should become a
template."; p132 §16). Save the cropped ad, the reading (scenes, product shots), the kept-vs-remade plan, the kept
clips and the product-scene prompt. A remix from a template regenerates ONLY the product scenes and joins them with
the kept scenes and the ad's own sound. Seedance bills at least 4 s per call, so merge neighbouring product scenes
into one call; product scenes use `generate_audio: false`. Higgsfield's nsfw filter refuses scary themes: say so in
one line and offer the full pipeline. A product scene that does not move is ONE picture edit of its middle frame, held for its length — no video call
(Sean 2026-11-03: "for product scenes that are images, then there's no video generation cost"); still/moving comes from
the analyzer's per-shot type.

**Reuse first** (Sean 2026-11-03: "we wanna minimize the time. We wanna minimize the generation, maximize the
reuse."). Per part, cheapest first: no product → keep the ad's own clip; product still → one picture edit held for
its length; product moving → video for those seconds only (neighbours merged, 4 s floor); template already read →
no new reading or plan. No crop step for the user (Sean 2026-11-04): find the ad area automatically (pixels that
change across frames); kept clips and still pictures are cut to that area and resized to a standard shape in the
join; remade parts may go uncropped ONLY with the prompt line "if the reference is a layout with a text panel … recreate
only the main video, full frame, ignore the panel, its text and its photo" (proven: panel removed and product
swapped, Higgsfield 01a1a46a). Without that line Seedance kept the panel's own product (01a1a184). A raw crop
(e.g. 392×712) is refused by Seedance ("video dimensions or aspect ratio are not supported"): resize every crop to
720×1280 / 720×960 / 720×720 / 960×720 / 1280×720.

**Source download is server-side.** An Instagram CDN video URL (Apify `videoUrl`) answers a browser User-Agent or any
Referer with a 302 carrying no CORS header; a server request gets 200. The URL also expires (signed `oe=`). Download on
the server, store our own copy, and never hand the CDN URL to a browser or keep it in a template.
A server fetch can still be walled where a home IP is not (Facebook share links from the worker's IP): prove every
fetch fix by running the shipped function inside the prod worker container, never by a fetch from your own machine
(`code-map.md` → Traps).

Draft = 480p video, 1k pictures, until sign-off. Regenerate only what changed; reuse paid output; save every paid
output the moment it lands. Text, captions, prices and logos are added in post, never drawn by a model; the product's
own printed label stays.
