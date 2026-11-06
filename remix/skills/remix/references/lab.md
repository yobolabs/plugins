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
   5. check fit: does this product belong in this ad's scenes? If not, say so and stop (`review.md` § Fit: only templates the product fits);
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

## Rule 0: lab defaults are the product

The remix lab (v9.00) is the working prototype. **The team uses it at https://remix-lab.yobolabs.ai** (Yobo Connect
sign-in, no Cadra key field; how it is wired: lab manual → "Where it runs"). Never send the team the `/proto/…` link
or ask anyone to paste a key. Its defaults are the product defaults unless Sean said otherwise
and the quote is on file. A spec, story or "parity: Left" row that diverges from the lab is a question to Sean the
same day, never a silent default (that is how the ad's own music, per-shot line drawings and the breakdown view all
shipped off). Lab manual: `remix-context` search "Remix lab — how it works"; team steps: search "Remix Lab — team how-to".

