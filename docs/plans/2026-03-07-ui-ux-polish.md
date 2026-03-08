# QTRIP — UI/UX Polish + SEO Enhancement Design

**Date:** 2026-03-07
**Status:** Approved

---

## 1. SEO & Meta (index.html + Home page)

- Complete `index.html` meta tags: description, keywords, theme-color
- OG tags: title, description, image, url, type
- Twitter card tags
- Create `public/` with SVG favicon, `robots.txt`, `manifest.json`
- JSON-LD Organization schema in index.html
- Home page footer: copyright, legal link placeholders, social links

## 2. ErrorBoundary Retheme

- Pink/fuchsia gradient theme matching the app
- Friendly icon + message + retry button layout
- i18n support for error text

## 3. Loading States

- Reusable `Skeleton` component (line, circle, card variants) with `animate-pulse`
- Branded `Spinner` component with pink gradient for async ops
- Apply skeletons to destination cards, activity cards, accommodation cards

## 4. Page Transitions

- Framer-motion `AnimatePresence` fade+slide between route steps

## 5. Accessibility

- `aria-label` on icon-only buttons (language switcher, profile, mobile menu)
- `role="status"` + `aria-live="polite"` on spinners
- Skip-to-content link in index.html / App
- Ensure form inputs have labels

## 6. Responsive Fixes

- Audit Home hero, destination cards, booking detail on small screens
- Mobile nav overflow check
