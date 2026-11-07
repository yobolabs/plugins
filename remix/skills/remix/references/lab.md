# Lab: open it, drive it, who does what

Back to [SKILL.md](../SKILL.md). Read on every invocation of the skill (with or without an ad link), before the
first step. Principles this serves: P1 (the lab's defaults are the product), P3 (every step a tap; the lab is the
engine) and P6 (say what you see, never false).

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
      save the video file, reload the lab WITHOUT `?ad=` and upload the file (the old link stays bound otherwise). Results the page shows (sheets, videos) load through the lab Worker, never a direct browser fetch of a vendor CDN: without a CORS header the fetch fails with no error shown.
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
   5. check fit: does this product belong in this ad's scenes? If not, say so and stop (`../remix-agent/references/review.md` § Fit: only templates the product fits);
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
install anything locally." The lab page is the engine; a teammate's Claude session drives the page (step 4 of "When someone invokes this skill"):

| The lab page does (in their browser) | The user's Claude session does (by driving the page) | The user's session never does |
|---|---|---|
| load the ad (link or file), read it, crop, read the panel prompt, plan kept vs remade parts, cut and join (ffmpeg.wasm), every paid call (Cadra team key inside the lab's server), the MP4 download | open the lab (`?ad=`), search the Remix KB, fill the product, check fit, press Make it, watch, review the frames, download, write the learnings note | run ffmpeg or any local tool for the remix itself, call the Higgsfield MCP/API, use any Cadra key, vault or proxy, install anything (pip, brew, npm, env vars, keys) |

If a step seems to need something from the right-hand column, the lab is missing a feature: tell the user in one line
and report it (Sean / the lab owner). Never work around it on the user's machine. SKILL.md's pipeline and the stage references describe
what the lab and Ad Studio do inside; they are for builders, not steps for a user's session to run.

## The lab twin is a gate for our tests (temporary)

Sean, 2026-11-08 (verbatim): "The lab is a gate only now for testing".

Scope, and only for now: our own test attempts (team or agent proof runs on dev). Every such attempt runs with its lab twin, step by step. A test step is not passed, and the next paid test step does not start, until its lab twin step exists and is compared on output, skill rule, KB and screen. A twin that stops is a blocker, reported the same turn.

It never gates a merchant's run or any product code path.

## Rule 0: lab defaults are the product

The remix lab (v9.00) is the working prototype. **The team uses it at https://remix-lab.yobolabs.ai** (Yobo Connect
sign-in, no Cadra key field; how it is wired: lab manual → "Where it runs"). Never send the team the `/proto/…` link
or ask anyone to paste a key. Its defaults are the product defaults unless Sean said otherwise
and the quote is on file. A spec, story or "parity: Left" row that diverges from the lab is a BUG in the port: fix the
port to match the lab, never a silent default (that is how the ad's own music, per-shot line drawings and the
breakdown view all shipped off). **It is never a question to Sean** (Sean 2026-11-06, on a storyboard ask: "This is
already all fully designed and understood when we did remix lab. Why is this a question?"). **Nothing is decided by
code** (Sean 2026-11-06: "Nothing is decided by code. Everything is based on our expertise" … "Code is only the tool
we use when we decide what to do"). What a remix does comes
from our written expertise: the principles (`HOW-REMIX-WORKS.md` §A), this skill, the lab manual and Sean's quoted
rules. Code, the lab page's code included, only carries that out. "The code does X" is never a reason for X. Where code
differs from the expertise, the code is the bug. Before filing any remix design ask, or re-filing one you inherited,
read the expertise. If it answers the question, apply it. Ask Sean only when the expertise is silent, or when someone
wants to change it. Lab manual: `remix-context` search "Remix lab — how it works"; team steps: search "Remix Lab — team how-to".

## Lab traps seen 2026-11-06 (fast-cut food montage, KB note 2026-11-06-fast-cut-food-montage-lab-misses-8544)
- **A storyboard grid sent to the video model carries no panel labels.** Captions like "1 · 0.1 s" on the grid were
  drawn into the Seedance 2.5 video (top-left). Send the grid without labels, and the prompt says to ignore panel
  layout and to put no text on screen (text rule: `../remix-agent/SKILL.md` P5).
- **Publish the lab only from the live page or the newest `remix-lab.vNNN.html`.** The working file `remix-lab.html` in
  the p130 spec folder went stale (v8.76 while v9.14 was live). Publishing from it would drop every later fix (v9.15
  label-free model grid, YMS-777). Copy the newest version over it before you edit, and keep an undo copy of the live
  prototype (`undo/prod-proto-<id>-before-vNNN.html`).
- **The cut detector misses fast warm-tone cuts:** about 20 hard cuts were read as 2 scenes. Check the scene count
  against the ad by eye before the plan; too few scenes = wrong plan.
- **Keep the lab tab alive while it renders:** a hidden cmux tab reset the lab mid-render and lost the job ids. Use
  focus emulation (see Usage step 1), never reload during a run.


## The lab keeps every video (v9.17–v9.18, Sean 2026-11-06)

Sean: "You need to have every video I make with remix in context stored somewhere."
- **The run record starts when the ad loads**, not at the first paid output (v9.12 "no empty runs" is replaced). The
  ORIGINAL ad is copied to our S3 at load (`saveSource` → `remix-lab/<org>/<run>/source.mp4`, `source.key` on the run):
  an uploaded file directly, a link through the same URL the preview plays (Instagram links expire). Paid outputs
  (`saveAsset`) and the final (`saveFinal`, on join) were already saved as they land.
- **A failed save is ONE line on the page, never a block** (default open).
- **The prototype page on `*.pages.yobolabs.ai` saves nothing** and says so with a link to the team lab. Never answer
  CORS with credentials for `*.pages.yobolabs.ai`: any author's prototype JS runs there, and the sessionless origin is
  the tenant boundary.
- **Own Cadra key on the team page:** optional field, held in a page variable only (never localStorage, the store, the
  snapshot or logs). The page sends it as `X-Lab-Own-Key`; the Worker uses it instead of the team key for that call and
  logs only `paid: own|team`. The snapshot records `paidBy`.
- **Test runs:** mark them (`config.test: true`, status `failed`, title `test: …`) through the store PATCH. Never delete.
- **Where every video is listed:** `_context/slides/_specs/p131-remix-in-ad-studio/videos/INDEX.md`, rebuilt daily by
  `_devtools/remix-video-index/build.py` (read-only, prod + dev; keys not links; lost originals named by run id).
  Get a file through the back-office page in the row, or presign the S3 key.
- **Backfill a link-only original free first:** `yt-dlp` the post link, then store it through the lab store
  (`upload-url` → PUT → PATCH `source.key`). Apify only after asking.
