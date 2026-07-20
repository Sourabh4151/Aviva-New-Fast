/** Resolve the element that actually scrolls (body vs documentElement). */
export function getPageScroller() {
  const { body, documentElement } = document;
  if (body.scrollHeight > body.clientHeight) return body;
  return documentElement;
}

/**
 * Smooth-scroll to a section, accounting for the fixed header.
 * For #enrollment-process only: if the section is taller than the remaining
 * viewport below the header, align the section bottom with the viewport bottom
 * so all enrollment steps stay visible.
 */
export function scrollToSection(hashOrId) {
  const id = String(hashOrId || "").replace(/^#/, "");
  if (!id) return;

  const section = document.getElementById(id);
  if (!section) return;

  const scroller = getPageScroller();
  const header = document.querySelector("header");
  const headerHeight = header ? header.getBoundingClientRect().height : 0;

  const currentScroll = scroller.scrollTop;
  const rect = section.getBoundingClientRect();
  const sectionTop = rect.top + currentScroll;
  const sectionHeight = section.offsetHeight;
  const viewportHeight = scroller.clientHeight;
  const remainingViewport = Math.max(0, viewportHeight - headerHeight);

  let targetTop = sectionTop - headerHeight;

  // Only enrollment-process may bottom-align when it overflows the remaining viewport.
  if (id === "enrollment-process" && sectionHeight > remainingViewport) {
    targetTop = sectionTop + sectionHeight - viewportHeight;
  }

  const maxScroll = Math.max(0, scroller.scrollHeight - viewportHeight);
  const top = Math.max(0, Math.min(targetTop, maxScroll));

  scroller.scrollTo({ top, behavior: "smooth" });

  if (window.history?.replaceState) {
    window.history.replaceState(null, "", `#${id}`);
  }
}

/**
 * Close mobile menu first (caller), wait 2 animation frames for layout to
 * settle, then measure header and scroll.
 */
export function scrollToSectionAfterMenuClose(hashOrId) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSection(hashOrId);
    });
  });
}
