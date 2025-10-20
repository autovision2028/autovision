
AutoVision Fixed Package

# AutoVision Initiative — Website

Modern, accessible marketing and application website for the AutoVision Initiative. It showcases services, gallery, eligibility information, FAQ, and includes two application flows:

- Public application: `join.html`
- Provider application: `provider.html`

Both forms integrate with EmailJS for notifications and Supabase Storage for file uploads. The site includes UX enhancements (drag-to-scroll, back-to-top, active nav state, reduced-motion support) and privacy-friendly analytics via Plausible.

## Tech Stack

- Tailwind CSS via CDN (with custom color extensions in-page)
- Vanilla JavaScript
  - `js/site.js` for UI behavior (AOS, nav, back-to-top, drag-to-scroll)
  - `js/notifications.js` for form logic (EmailJS + Supabase)
- EmailJS (client-side email service)
- Supabase Storage (file uploads)
- Plausible Analytics (privacy-friendly analytics)

## Project Structure

```
AUTOVISION_Fixed/
├── index.html            # Homepage (hero, services, gallery, eligibility, FAQ, provider CTA, footer)
├── join.html             # Public application form (Join AutoVision)
├── provider.html         # Provider application form
├── css/
│   └── style.css         # Custom styles: focus-visible, reduced-motion, utilities (hide-scrollbar)
├── js/
│   ├── site.js           # UI/UX scripts (AOS init, nav highlight, back-to-top, drag-to-scroll, FAQ)
│   └── notifications.js  # Form submission logic (EmailJS & Supabase uploads, status updates)
├── img/                  # Images (hero, services, gallery, logos)
└── README.md             # This document
```

## Development

No build step is required. Open the HTML files directly in a browser or serve the folder with a simple static server.

- Edit styles in `css/style.css`.
- Edit UI behavior in `js/site.js`.
- Edit form logic in `js/notifications.js`.

Recommended local server options:

- VS Code Live Server extension
- Python: `python -m http.server 8080` (then open http://localhost:8080)

### Tailwind configuration

Tailwind is loaded via CDN with extended colors configured inline in each HTML file. Keep the color definitions in `index.html`, `join.html`, and `provider.html` in sync. If the project grows, consider migrating to a build pipeline and central `tailwind.config.js`.

## Deployment

This is a static site. You can deploy to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

Steps (example):

1. Upload the entire `AUTOVISION_Fixed/` directory to your static hosting provider.
2. Ensure your custom domain (e.g., `autovision.ng`) points to the host.
3. Verify that Plausible’s `data-domain` in each HTML head matches your domain.

## Environment & Integration Notes

### EmailJS (client-side email)

- SDK: included via CDN in each page that needs it.
- Initialization example in `index.html` footer and similarly in other pages:

```html
<script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
<script>(function(){ emailjs.init("YOUR_PUBLIC_KEY"); })();</script>
```

- Templates and service IDs are referenced in `js/notifications.js` inside `sendEmails()`.
- Replace the public key and template IDs with your EmailJS values.

### Supabase (file uploads)

- SDK: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`
- Upload helper is used in `js/notifications.js` via `uploadToSupabase(file)`.
- Ensure your bucket policy allows public reads of uploaded files or that you return a signed URL.
- Store only non-sensitive docs and validate file type/size — code already guards for PNG/JPG/PDF, ≤10MB.

### Plausible Analytics

- Script is included in `<head>` of `index.html`, `join.html`, and `provider.html`:

```html
<script defer data-domain="autovision.ng" src="https://plausible.io/js/script.js"></script>
```

- Replace `autovision.ng` with your actual domain as needed.
- Ad-blockers may block analytics locally; verify in the Plausible dashboard or via Network tab.

## Analytics Events (Conversions)

We track custom conversion events on successful form submissions.

- File: `js/notifications.js`
- Events fired after successful submit:
  - `window.plausible('Join Form Submitted')`
  - `window.plausible('Provider Form Submitted')`

These calls are guarded so they won’t throw if Plausible is blocked:

```js
try { if (window.plausible) { window.plausible('Join Form Submitted'); } } catch(_) {}
```

### Adding a new event

1. Decide an event name, e.g., `Apply CTA Clicked`.
2. Fire it on the interaction:

```js
if (window.plausible) window.plausible('Apply CTA Clicked', { props: { location: 'Hero' } });
```

3. In the Plausible dashboard, add a Goal with type “Custom event” and the exact name.

## Accessibility & UX

- Focus visibility via `:focus-visible` in `css/style.css`.
- Reduced motion respected globally; AOS animations are disabled for users preferring reduced motion.
- Back-to-top button appears after scrolling and respects reduced motion for smooth scroll.
- Active nav highlighting with `IntersectionObserver` for `#services`, `#gallery`, `#eligibility`, and `#faq`.
- Mobile sliders support drag-to-scroll on desktop with momentum on mobile.

## Contributing

- Keep IDs and existing form logic intact unless changing requirements.
- Follow the established structure:
  - UI-only behaviors → `js/site.js`
  - Form submissions & integrations → `js/notifications.js`
  - Styles → `css/style.css`
- Use descriptive commit messages and keep changes scoped per feature.

## Troubleshooting

- Emails not sending: check EmailJS public key, service/template IDs, and browser console errors.
- File uploads failing: verify Supabase URL/keys, bucket policy, and file type/size.
- Analytics not visible: confirm domain in `data-domain`, try another browser without ad-blockers, or view Network requests to `plausible.io/api/event`.

---

For questions or improvements, open issues or propose changes with clear scope and testing notes.
