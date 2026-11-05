---
name: remix
description: "Use when working on Ad Studio Remix (spec p131): remaking an existing video ad (Ad Library ad, YouTube/IG/TikTok link or upload) for a merchant's own business, in slides, yobo, msg-api or the Cadra agent and functions, on the web or on WhatsApp. Covers the fixed pipeline, the brief, storyboards, the AI review gate, human approval, video parts, join with the ad's own music, export and post. Also use when the user mentions \"remix\", \"remix video\", \"storyboard\", \"storyboard review\", \"line drawing\", \"brief\", \"Use these\", \"go:yes\", \"needs:use\", \"join\", \"remix stuck\", \"remix journey\", or \"remix_make\". Invoked with or without an ad link: first-time setup if needed (Remix KB MCP), then open the team Remix Lab in the browser with the ad loaded, then follow the pipeline below."
---

# Remix (p131)

Remix = take an existing video ad and make something NEW for THIS merchant. The original ad is the quality
benchmark, not the blueprint (see Core principle: benchmark, not blueprint).
It is the main entry of Ad Studio video. General Ad Studio video, Higgsfield routes and the editor stay in
`yobo:ad-studio-video`; everything about the remix pipeline lives here.

**Universal rules only in this file.** Anything true for one ad type goes in `references/types/<type>.md`; anything
true for one stage goes in `references/<stage>.md`. Never add a brand, customer or run name to a generic file.
Load a type file only when the source ad is that type (see "Pick the type").

## Setup: connect the `remix-context` MCP (required)

Users of this skill have no repo or `_context` files. Every spec, lab manual, how-to and learnings note named below
lives in the Remix knowledge base: connect the `remix-context` MCP server, then `search` → `read_document`, and cite
the resource URI. A path below (`_context/…`, `yobo:ad-studio-video` `references/…`) is the document's source path in
the KB, not a file to open. Not connected → run the first-time setup in `references/setup.md` (or ask the user to); never guess a rule
from memory.

## When someone invokes this skill (with or without an ad link)

Sean 2026-11-04: "When someone invokes the remix skill and passes in the URL, even if they don't pass the URL,
let's pop open the browser and load the remix site." Do this first, every time:

1. **First time?** No Remix knowledge base tools in this session (no `search` on the Remix KB) → walk the user
   through `references/setup.md` (Claude app → Settings → Connectors) (Remix KB MCP; users have no local context files, the KB is their only source).
2. **Search the Remix KB** for this ad type and any past run of the same ad (`remix-context` `search`).
3. **Open the team lab** in the user's own browser (they sign in with Yobo Connect; never ask for a key):
   ```bash
   L='https://remix-lab.yobolabs.ai'
   AD='<ad link, or empty>'                     # Instagram/TikTok/YouTube link or a direct .mp4
   [ -n "$AD" ] && L="$L/?ad=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$AD")"
   open "$L" 2>/dev/null || xdg-open "$L" 2>/dev/null || cmd.exe /c start "" "$L"
   ```
   `?ad=` loads that ad as soon as the page opens (it survives the sign-in). A session that drives its own
   browser tab opens the same URL there instead.
4. **Drive the lab yourself** (Sean 2026-11-04: "You're supposed to help me with this. You're supposed to drive
   it"). Never hand the user a list of clicks. **Browser tool = browser-use** (Sean 2026-11-04: "It should use
   browser use, not claude-in-Chrome"): the browser-use plugin's MCP tools (`browser_exec`, `browser_screenshot`).
   They drive whichever Chrome browser-use is attached to: often a separate agent Chrome window, not the one the
   user is looking at. So **in your first line say which window and tab** (the tab title starts with "Remix lab"),
   and bring that tab to the front (`activate_tab`) when the run starts so the user can watch; that is the one
   time to activate. Never Claude in Chrome, never a browser-use CLI, never install anything, never ask the user
   which tool. Open the lab with browser-use `new_tab(<?ad= URL>)`, then:
   1. wait until the ad has loaded ("Loaded: … s"); if the sign-in page shows, ask the user to sign in, then go on.
      Ad stuck (no "Loaded", the video never gets a first frame): the tab is in the background and the browser
      paused its media. Turn on focus emulation (CDP `Emulation.setFocusEmulationEnabled`) and reload the video;
      never bring the user's window to the front. Short checks (a few seconds each), never long wait loops;
      A CDN link that sends no CORS header (e.g. an Ad Library `fbcdn` mp4) fails "Couldn't read the video's frames":
      save the video file, reload the lab WITHOUT `?ad=` and upload the file (the old link stays bound otherwise).
   2. type the product name and its **real size**. **Never ask the user for anything you can look up** (Sean
      2026-11-04: "You are supposed to search for that information. Stop asking me questions"; "It's fine to look
      for local, but it should also look and search online if needed"). Size, in this order: the label in the photo
      (ml, g, oz) → the user's own files (product notes, photos) → the Remix KB (product research for a known
      merchant) → the product's own listing or site (web search) → a stated estimate from a similar product. Say which source you used in one line and keep going.
      The only thing you may ask the user for is the sign-in;
   3. put the product photos into the photo box: every photo you have of it (front, side, top; up to 8), not only
      one. Files on disk: CDP `DOM.setFileInputFiles` on `#qPhoto` (it takes several). Otherwise build `File`s from
      their bytes (base64), wrap them in a `DataTransfer` and dispatch `drop` on `#qPick`. The thumbnail and file
      names appear when it worked. Every change the user or merchant wants (flyer words, which hand holds it, a fix
      after a bad run) goes into the **Prompt** box, nowhere else (Sean 2026-11-04: "it's also the place for the team
      to put in any overrides or adjustments"): on template reels it is pre-filled with the panel's prompt, so edit
      that text in place; what the box says wins over the lab's own lines;
   4. press **Make the product sheet** (1 paid picture: front, three-quarter, side, back) and look at it: every side
      must look like the product (shape, label, colours), nothing from the photos' background. Wrong → press again.
      Make it refuses to start without a sheet (Sean 2026-11-04: "create a character sheet even if it's a product
      swap");
   5. check fit: does this product belong in this ad's scenes? If not, say so and stop (rule: only templates that fit);
   6. press **Check the plan (free)** and read the plan line: which parts are kept (free) and which are remade (paid
      seconds). Every Keep part must be free of the old product, including on props (flyers, posters, screens,
      clothes); if a kept part still shows it, stop and report it. Say the plan and cost in one line, then press
      **Make it**: the user asking for the remix is the go, no second confirmation;
   7. watch the progress line until the video shows ("Reading the prompt shown beside the ad… N s" has its own
      timer and is skipped after 90 s; a 480p part usually takes 5–8 min at Higgsfield, longer at 720p+ or when it
      is busy; tell the user that expected time once; the run carries on by itself, so never reload mid-run); look at frames across the result (product visible, real size,
      no panel, no pasted-in look) and tell the user what you see, good and bad. The lab has no frame tool: in
      `browser_exec`, seek the result `<video>` to 6–8 times spread over its length, `drawImage` each onto one canvas
      strip, `toDataURL('image/jpeg')`, save and look at it. Check the KEPT parts too: props in the background
      (flyers, posters, screens, packaging) must not still show the old product, and an ending poster must stay a poster;
   8. save the MP4. **Download the MP4** is a `blob:` link: a click lands in the driven Chrome's own downloads folder,
      which your session may not be able to read. Instead, in `browser_exec`: `fetch(<the link's href>)` → `blob()` →
      `FileReader.readAsDataURL` → return the base64, decode it to a file in your scratchpad, and tell the user the
      path (a ~6 MB video passes fine). Then write the learnings note (`references/learnings.md`)
      and save it yourself with the lab's **Share learnings** box (title + text → Save).
   browser-use not available in this session → say so in one line (the user enables the browser-use plugin) and
   guide click by click meanwhile.

## Who does what — users install nothing (Sean 2026-11-04)

"Users will not be installing local things" · "All the users of this remix lab … will not and should not need to
install anything locally." The lab page is the engine; a teammate's Claude session drives the page (step 4 above):

| The lab page does (in their browser) | The user's Claude session does (by driving the page) | The user's session never does |
|---|---|---|
| load the ad (link or file), read it, crop, read the panel prompt, plan kept vs remade parts, cut and join (ffmpeg.wasm), every paid call (Cadra team key inside the lab's server), the MP4 download | open the lab (`?ad=`), search the Remix KB, fill the product, check fit, press Make it, watch, review the frames, download, write the learnings note | run ffmpeg or any local tool for the remix itself, call the Higgsfield MCP/API, use any Cadra key, vault or proxy, install anything (pip, brew, npm, env vars, keys) |

If a step seems to need something from the right-hand column, the lab is missing a feature: tell the user in one line
and report it (Sean / the lab owner). Never work around it on the user's machine. The pipeline sections below describe
what the lab and Ad Studio do inside; they are for builders, not steps for a user's session to run.

## Rule 0: lab defaults are the product

The remix lab (v9.00) is the working prototype. **The team uses it at https://remix-lab.yobolabs.ai** (Yobo Connect
sign-in, no Cadra key field; how it is wired: lab manual → "Where it runs"). Never send the team the `/proto/…` link
or ask anyone to paste a key. Its defaults are the product defaults unless Sean said otherwise
and the quote is on file. A spec, story or "parity: Left" row that diverges from the lab is a question to Sean the
same day, never a silent default (that is how the ad's own music, per-shot line drawings and the breakdown view all
shipped off). Lab manual: `remix-context` search "Remix lab — how it works"; team steps: search "Remix Lab — team how-to".

## The contract (Sean, 2026-11-03)

- **The storyboard is the contract.** A clean, well-formed storyboard (clear scenes, picture or clip each, dialogue
  that makes sense across scenes, beats mapped to the audio) means the video comes out close. Every storyboard fault
  (a 2 s scene with a 10 s beat, a different presenter per scene, an invented person) is visible before a cent is spent.
- **The brief is the contract.** What each scene must show: cast, set, lines, beats, keep/change/never. The check
  never invents its own target; where the brief lacks a field a check needs, the brief gains that field.
- **The quality checks are the gate.** Code checks plus AI review run on every set BEFORE the merchant sees it.
  A failed check is fixed and re-run; the merchant never sees a failed set.

## The fixed pipeline (no step optional, none skippable)

1. **Read the ad**: cuts, shots, still/moving, music bpm from pixels and audio (code, never the LLM). Then one reading
   (`video_blueprint`) fed the measured cut list.
2. **Brief** -> `references/brief.md`. Rewritten when the merchant's answers come in.
3. **Needs / questions**: ask everything missing ONCE (photos, product, cast), filled first from what the business already has.
4. **Line drawings**: position and framing only, per shot, from that shot's own source frame. Never sent to a video model alone.
5. **Storyboard images** -> `references/storyboard.md`: line drawing redrawn with new cast, set, product.
6. **AI review + code checks** -> `references/review.md`.
7. **Human approval** of each storyboard. Only the merchant approves; the agent never does.
8. **Video parts** (draft first, then final on request). Type decides how: `references/types/`.
9. **Join** -> `references/join-and-sound.md`: the ad's own music laid ONCE, cuts on its beats.
10. **Final -> approve / export -> post** (Buffer / Hootsuite route; direct IG/FB waits on Meta review).

**One exception — "Just swap the product" (merchant's choice, Sean 2026-11-03 ~20:2x: "Yes, let's add that. So that
would basically bypass a whole bunch of things."; YMS-705, p132 §15).** When the merchant picks it, steps 2-7 are
skipped. A product swap ALWAYS keeps the ad's own scenes without the product and remakes only the product scenes
(Sean 2026-11-04: "It should be default if you're just swapping the product … There should be no option to turn that
off"); see "Every finished video becomes a template" below for the parts. Each remade part is a Seedance 2.0
reference-to-video call with `video_urls=[that part]` + `image_urls=[the product sheet]`, 480p draft. The prompt
binds the inputs with @ tags first (`@Video1` = the part: people, place, camera, timing, never looks · `@Image1` =
<name> as a product sheet: looks and packaging, never framing), then says "Recreate @Video1 exactly … only change: the
advertised product becomes @Image1 (<name>), label exact. No text on screen." + the size rule + the template-prompt
rule below. Every mention uses the tag (`content-creation:higgsfield-video` § 2, rule 8); a panel script's own
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
- **A making-of ad needs a real recipe** (Sean 2026-11-04: "I don't think that's how you make a chicken with just an
  egg. There needs to be a chicken added"). When the ad shows ingredients turning into the product, the swapped
  ingredients must be a believable recipe for the merchant's product, with its MAIN raw ingredient in the most visible
  slot (the biggest pile, the first pour). Write this into the prompt; a 1:1 ingredient swap is not enough.
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
- **Template reels carry their own prompt** (Sean 2026-11-04: "grab the prompt from the video because it's shown on
  the left side … we should actually include that"). When the ad sits beside a static text panel, crop that panel
  strip (full height, ≤420 px wide) and read it with a plain TRANSCRIBE function (`panel_prompt_reader`: "copy every
  word exactly, never summarise"), ONE call on the whole strip; ≥200 characters = the prompt that made the ad.
  A yes/no or describe function summarises long text ("a long paragraph of prompt text"), and a layout reader
  (`ad_layout_reader`) runs past 90 s; slicing the strip did not help and repeated the overlap.
  Give it to the model as the script ("follow it shot for shot; wherever it names the advertised product, use ours
  and adapt how it is shown"). **The script also decides which parts are remade:** every scene overlapping a timed
  line that names the product (@Image1, product, logo, branding, label, packaging) is remade, even if the reading
  saw no product there (the product printed on flyers or a shirt pocket); a script with no time codes = remake the
  whole ad. Text the script prints on props (a flyer's words) follows the script, edited for the merchant; no
  captions or added text. Never send the panel as a reference IMAGE: the model copies images visually, and the
  panel's own product photo won.
- **Only suggest a template the product fits** (Sean 2026-11-04: "[that product] doesn't make sense for this type
  of video … we should never offer this as a suggested ad template"). Before suggesting or running a template for a
  product, check the product belongs in that ad's scenes and actions (category, setting, how the product is used in
  the shot list). A snack tin in a fashion-bag laundry ad came out as nonsense even with size and crop right.
- **Swap only when ONE thing changes: the product** (Sean 2026-11-04: "it's actually better to run it as a normal
  storyboard … because we have more than just a product image involved"). If the remix must also change what goes
  into the product (ingredients, a recipe), its packaging AND its contents, or several different items, use the
  storyboard pipeline: each changed scene gets its own approved picture. One video call cannot hold several changes:
  a making-of box ad kept the cookie ingredients when the box was swapped (01a1a5a4), and kept the cookie box when the
  ingredients were swapped (01a1a5b0).
- **Swap only within the same product type** (Sean 2026-11-04: "where the product is not the same type, for example
  a beauty product versus food or a pet … it doesn't translate well"). Food/drink, beauty/personal care, pet, fashion,
  tech and home products are used, held and shown differently; a swap keeps the original's actions, so a cross-type
  swap looks wrong. Different type → no swap: pick an ad of the same type, or use the storyboard pipeline. The lab
  (v8.89+) blocks a clear mismatch; when it cannot tell, you decide from the reading and say which type each side is.

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
(`references/code-map.md` → Traps).

Draft = 480p video, 1k pictures, until sign-off. Regenerate only what changed; reuse paid output; save every paid
output the moment it lands. Text, captions, prices and logos are added in post, never drawn by a model; the product's
own printed label stays.

## Core principle: build every video from a template (Sean 2026-11-05, architect gate-20261105-22)

Sean: "Templates give us a step-by-step way to build a video. We just have to build from a template."
Every way in (library template, the agent's script, a source ad) first becomes a TEMPLATE: each scene's job (hook,
product hero, proof, CTA), timing, roles, product scenes, reusable clips. The template is the plan on the one yobo run
record, versioned per edit; every step reads and writes it, and no step keeps its own copy. Then one pipeline builds
from it. Another merchant's offers, prices, brand and product names in a stored template become placeholders on load.
Design: `REVIEW.md` §13.28.
Music (Sean 2026-11-05): default = the source ad's own track; the merchant can search or pick a track we already have;
similar-track matching only with a free source (no paid music vendor). From scratch, the same match and search, seeded by the script's mood.

## Core principle: a source ad is optional; the storyboard is the contract (Sean 2026-11-05)

Sean: "I don't think we need an existing ad. We can create them from scratch as long as we can come up with a script
and then a storyboard can be generated. Remember, the key is we get to a storyboard, and the storyboard has all the
elements to generate the video."

- A remix starts from a source ad OR from a script (the agent's agreed concept). With a script, the script IS the
  brief: scenes, seconds, what each shows, lines, cast roles, product scenes. Then the same storyboard → review →
  approval → video pipeline runs.
- Never answer "make this idea" by offering unrelated ads. A source ad, when used, is a quality benchmark (see below).
- Design: `REVIEW.md` §13.27 (remix_start script source; architect gate pending).

## Core principle: benchmark, not blueprint (Sean 2026-11-05)

Sean: "Remix = take something that exists and make something NEW. It does not mean replicate scene by scene. The
original ad is a BENCHMARK for quality, not the exact BLUEPRINT. Lower our thresholds." (agent-architect
gate-20261105-12.)

- **Every check that compares with the source ad judges the ad's job, not a match.** Drift, storyboard review, the QA
  reviewer and set/scene checks ask: does the hook still hook, is the product the hero, does the call to action land,
  are pacing, energy and quality at least as good as the original.
- **Not failures:** different people, a different set, a different scene count or order, merged or dropped scenes,
  wardrobe and prop details. Record them as info on the run; never stop on them.
- **Still block (harms the merchant):** the wrong product or a mismatched product, another brand's logo or text,
  off-brand or unsafe content, broken quality (garbled faces or text, a person who changes look inside OUR ad).
  "Block" means: not shown to the merchant, fixed once automatically (regenerate that part with the cast reference),
  then ask with buttons [Use it anyway] / [Try again]. Never a dead stop (R6).
- A product swap and a template still keep the ad's own clips by design (merchant's choice); the principle governs
  what the checks treat as a failure, not which parts are kept.
- Changing a check's threshold is a behaviour change. If a counted cap changes, it still needs its `LIMITS.md` row.

## Core principle: the agent is a problem solver (Sean 2026-11-05)

Sean 2026-11-05: "If the agent knows that, oh, okay, there's a problem, I found a problem … why don't they continue
and ask and then deal with it instead of erroring out? … This should be part of the core principles of the agent. It
should be a problem solver."

**Every check fixes or asks. No check ever stops a remix as its first answer.** This holds for every gate in the
pipeline (swap fit, product fit, drift, source length, QA, credits, needs) and for the agent's own turns:

1. **Fix it yourself, once.** Feed what the check found back as a correction and re-run that step ("keep the same
   people as the ad, add nobody"; "show it at 90 ml next to the hand"). Then run the check again.
2. **Still failing → ask ONE specific question with buttons** naming the problem and the choices
   ("The new plan adds a person. [Keep original people] [Allow new person]"). The answer carries the run on from
   the same step. The merchant never retypes what they already gave.
3. **Stop only when nothing is left to try**, and even then say why in one plain line with the next button.
   "I couldn't…" / "I'm looking into it" with no reason and no button is a bug.
4. **Log every fix and every ask on the run** (which check, what it found, what was tried), so a stall is never
   a mystery.
5. **Effort has an end (Sean 2026-11-05: "make sure that the agent will not go on indefinitely if the problem is
   unsolvable … it really made an effort … then at some point it won't be able to continue and … let the team know
   … in the meantime maybe try a different thing, maybe try a different video").** Per check: one self-fix, then one
   ask, and keep going while each attempt changes something. Stop on JUDGMENT, not a count (Sean 2026-11-05: "the
   signals for it's just not going to work appear … there must be some judgment"): the same refusal again with nothing
   changed, a block the remix cannot fix (Higgsfield down, the nsfw filter refusing the theme, an unreadable source), or
   a requirement only someone else can meet (no fitting product, no credits and no payment). The code records these
   signals on the run; the agent judges from them. On stop: tell the merchant ONE line with the way forward
   ("This video isn't working out. The team is looking at it. Meanwhile:" [Pick a ready ad] [Try another video]),
   and alert the team once (the run lands in the back-office Remix monitor "needs help" queue + one team post with the
   remix, the signal, and what was tried). Giving up at the first refusal is as wrong as looping. Never loop, never re-ask the same question, never spend more after the stop.

A new check, gate or refusal is not done until it has its fix step and its question. Reviewers block a gate that
only stops.

**Every choice or stop has a forward option** (Sean 2026-11-05, agent standard R6): the merchant can always move the
work on without fixing anything themselves: [Continue] / [Keep it] / [Use your best pick], with the change option
BESIDE it, never instead. A message whose only button is [Change more], [Try again] or "tell me what to change" is a
bug. When the run truly cannot continue, the forward option is another way: [Pick a ready ad], [Try another video], a
simpler version, or "the team is on it". Passes: [Keep original people] [Allow new person]; [Keep it] [Remake it].

**Where it lives in Cadra (Sean 2026-11-05: "this is where we set the intent … there must be a way for it to solve and
troubleshoot problems … the tools must support this too … the tools need to be accommodating").** Three parts, per
the Cadra standard (root prompt = routing, voice, hard rules only; feature behaviour in the role's skill + reference
files):

| Part | Holds |
|---|---|
| **Intent** (the remix role / skill template, first line) | The mission: this merchant gets a finished video they approve. Every turn is judged by whether it moves the run toward that. |
| **Troubleshooting reference** (a reference file of the remix skill, read on demand) | One row per refusal code: what it means, the fix the agent tries, the question + buttons if the fix fails, which tool applies the answer. |
| **Accommodating tools** | A refusal is never a bare error: it returns `{code, reason (plain), fix, ask: {question, buttons}}`. Anything a check can ask to change has a tool that changes it (cast, people kept, product, size, trim, scene, route), so the answer to a question always has a way to land. |


## WhatsApp first

- Every step is a **button tap** in the chat (msg-api reply buttons -> yobo `tap.ts`), never the agent, never typing,
  never a required web page. A web link is an optional extra.
- **Every line remix posts itself speaks in the agent's Instinct persona** (Sean 2026-11-05: "we're supposed to use the
  instinct persona"; p126, Yobo KB `yobo-agent/_specs/p126-instinct-persona/skill/persona-rules.md`). Copy rows and code
  fallbacks are written in that voice and scored with the Jev voice scorer (precedent YMS-490). Never a machine line
  ("That button cannot do this now").
- Every failure is **ONE plain line** in the chat's language saying what happens next, with a button when there is a
  next step. Never silence, two lines, or a contradicting line.
- The agent handles free text and questions only, with typed remix tools. It never presses Approve, never states a
  price, never promises text/logos drawn by AI. Detail: `references/whatsapp-journey.md`.

## Standing rules

- **Proof replays never post into a chat a person uses** (a dev chat may be someone's phone: a replayed stop was read
  as a real failure). Use a test conversation, or put "[TEST]" in the text.
- **The remix lead decides; never ask Sean for sign-off on video work** (Sean 2026-11-05: "Stop asking me about
  sign-off on these video ads. You have a budget, use the budget, do this autonomously." and "No paid" for vendors).
  Architecture calls go to the agents lead's gate, template approval is the lead's QC check (frames, product right and
  real size, no other brand, no garbled faces/text), spend stays inside the day's budget. No paid third-party vendor
  (music libraries etc.) without Sean naming one. Ask Sean only for what the CLAUDE.md money/customer/delete rules name.
- **No paid render without a cleared budget** (pictures, draft clips, finals all bill the platform key, dev too).
  When Sean has given a budget for the day, the ledger owner (the remix lead) clears each run inside it and logs it in
  the day's paid-budget ledger; never ask Sean again per run (Sean 2026-11-05: "I already gave a budget today so no
  need to ask me if the budget is still there"). No budget given → ask Sean for that run. Prove with unit tests and
  free pages first; name the cost (scenes x seconds x model) before an end-to-end run. Every subagent brief says "no
  paid renders" unless the lead cleared that run.
- **Pricing is parked.** Never add or change a price or credit UX. The free first remix is the MQL waiver; every paid
  quote or start must name the remix so the waiver applies.
- **Say "Remix", never "Remake"** (UI copy, routes, code names, docs).
- **Never call the source ad "your ad"** (Sean 2026-11-05: "why would it tell me a person isn't in my ad — Yobo built
  this ad"). The merchant's ad is the remix; the one being copied is "the original ad" (id "iklan aslinya", es "el
  anuncio original") in every line, copy row and prompt the merchant sees.
- **A limit needs a `LIMITS.md` row** (caps, timeouts, retries); a limit that fires logs on the job.
- **Never remove what another ad type needs.** Diff against the last version before shipping a fix for one type.
- **Proofs never post into a chat a person is using** (2026-11-05: test replays landed in Sean's live dev chat 3 min
  after his real tap and read as his remix dying). Replays and injected taps go to a test conversation or test number.
  With no test line, mark every posted text "[TEST]" and tell whoever watches that chat first. One driver per chat:
  when the person is live, builders watch and do not tap.
- **Dev passing is not prod passing.** Cadra prompts/skills/tools are per-env rows; diff dev vs prod before a promote.
  A proof is a real end-to-end run (link to delivered video) per ad type, not free steps on a synthetic inbound.
- **Team alerts stay in their own env** (YMS-738, 2026-11-05: a dev alert in the prod channel linked to prod → "remix
  not found"). Links use the server's own host (`NEXT_PUBLIC_APP_URL`, else `NEXTAUTH_URL`), never a hard-coded prod
  fallback; the env label comes from `NEXT_PUBLIC_ENVIRONMENT`, never `NODE_ENV` (it is `production` on the dev
  worker); dev reads only `YOBO_REMIX_ALERTS_DEV_CHANNEL_ID`. Never join a dev bot into a prod channel or put a prod
  channel id in a dev proof to make it pass.
- **Agents make, self-check, show and wait.** A failed self-check is fixed or asked about, never a stop (see Core principle above).
- **Every finished remix uploads its learnings to the Remix knowledge base** (Sean 2026-11-04: "because it's run by
  internal users … after a remix completes a video, it needs to upload the learnings up to the remix knowledge base").
  Finished = a final video delivered, or a paid run that failed. Same turn, before you report done: write one
  learnings note and sync it → `references/learnings.md` (where, format, how to upload, what goes to the skill).
  Never leave a paid run's lesson only in chat. Read the KB first (`remix-context` MCP: `search`, then `read_document`)
  before any remix, so the team's past learnings are applied.

## Pick the type

Decide from the reading, before the brief. The default follows the ad: people talking -> people-dialogue; else
product-hero. Merchant's own pick wins.

| Source ad is | Load |
|---|---|
| people on screen, speech or dialogue | `references/types/people-dialogue.md` |
| a product moving through shots, no people speaking | `references/types/product-hero.md` |
| fast cuts of stills held on beats | `references/types/montage.md` |
| video and stills mixed (keep/mine clips) | `references/types/mixed.md` |
| a phone / app / website screen shown | `references/types/screens.md` (also applies inside any other type) |
| the ad beside a static prompt panel (template post) | `references/types/template-reel.md` (also applies inside any other type) |

## References (load on demand)

| File | When |
|---|---|
| `references/brief.md` | writing, rewriting or feeding the brief |
| `references/storyboard.md` | line drawings, storyboard cards, per-card fields |
| `references/review.md` | AI review, set check, code checks, known gaps |
| `references/join-and-sound.md` | joining parts, music, beats, export |
| `references/whatsapp-journey.md` | tap ids, copy rows, per-step buttons, failure lines |
| `references/code-map.md` | where each step runs in slides / yobo / msg-api / Cadra |
| `references/learnings.md` | after every finished or failed paid remix: the learnings note + Remix KB upload |
| `references/setup.md` | first use on a machine: connect the Remix KB MCP (nothing else) |
| `references/types/*.md` | one per ad type |

Related (team repos only): `yobo:ad-studio-video`, `yobo:whatsapp`, `yobo:social`, `yobo:messaging`. Specs, lab manual,
Higgsfield gotchas and learnings: `remix-context` MCP (search "p131", "remix lab", "higgsfield gotchas").
