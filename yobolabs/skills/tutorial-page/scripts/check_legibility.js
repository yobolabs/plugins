// Legibility check for a rendered tutorial page. Run it in the page (DevTools console, or
// J(open(".../check_legibility.js").read()) from capture.py) at 1440 wide AND at 390 wide.
//
// For every screenshot: scale = shown width / source CSS width (data-srcw), and
// px = scale * the smallest font the reader must read in it (data-minfont, default 12).
// Pass = every px >= 12, every image loaded, no side scroll. A failing shot is cropped
// tighter or split into two steps — never shipped.
(() => {
  const rows = [...document.querySelectorAll('img[data-srcw]')].map(i => {
    const w = i.getBoundingClientRect().width, s = w / +i.dataset.srcw;
    return { src: (i.dataset.shot || i.currentSrc.split('/').pop()).slice(0, 60), shown: Math.round(w),
             scale: +s.toFixed(2), px: +(s * +(i.dataset.minfont || 12)).toFixed(1), loaded: i.naturalWidth > 0 };
  });
  return JSON.stringify({ vw: innerWidth, sideScroll: document.documentElement.scrollWidth > innerWidth,
    min: Math.min(...rows.map(r => r.px)), fail: rows.filter(r => r.px < 12 || !r.loaded).map(r => r.src), rows });
})()
