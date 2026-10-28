# ARASH — Built from curiosity

An original portfolio for Arashdeep Singh. A dependency-free static site with a custom interactive 3D particle sculpture, responsive project gallery, accessible project dialogs, project filtering, and reduced-motion controls.

## Run locally

Requires Node.js 18 or newer. No installation or API keys needed.

```sh
npm run dev
```

Open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks, `npm test` for physics and asset-integrity checks, and `npm run build` to generate `dist/`.

## Source organization

- `app.js`: real project data, gallery, dialogs, navigation, Curiosity Engine, shared frame scheduler.
- `experience.js`: project tour, floating previews, chapter dock, build story, contact draft.
- `motion.js`: delegated hover effects, marquee, section arrivals, draggable personal notes.
- `particles.js`: pointer-repelling ASCII typography and independently testable spring physics.
- `scene.js`: adaptive magnetic cursor, drifting full-screen particle field, and opening-title choreography. It uses the shared renderer and requires no paid package or access token.
- `style.css`: the single consolidated, formatted stylesheet for the black/purple/neon design.

The old enhancement stylesheets, duplicate reveal observer, and click-only signature effect were removed. Continuous canvas work shares one frame loop, capped near 30fps and suspended when the document is hidden. Each canvas skips rendering offscreen; text particles also stop when settled.

The opening screen uses a shortened headline and a larger sculpture. The spring cursor changes state over projects, canvases, fields, and navigation; it restores the standard pointer for modal dialogs and keyboard navigation. Touch and reduced-motion modes retain the native cursor. Small moving lights and a scroll-responsive field add page-wide depth without blocking clicks.

## Interactive ARASH typography

Both the hero and contact section contain a glyph particle field spelling ARASH. Pointer movement or touch pushes nearby glyphs away; spring forces restore the lettering. Space or Scatter creates a burst. Home or Reform resets the field. This also works with keyboard controls, and becomes static with reduced motion.

## The creative feature: Curiosity Engine

The hero and Playground contain synchronized 3D point clouds rendered using Canvas 2D, perspective projection, and depth sorting. The connected torus represents human-centered products; a harmonic loop represents scientific experimentation; a sphere represents exploration. Each transformation reveals a personal story and a related real repository.

- Drag either object or use arrow keys to rotate it.
- Click the hero sculpture or its visible hint to change dimensions.
- The Playground buttons select dimensions directly.
- Space changes dimension while a canvas has keyboard focus.
- Adjust energy, pause auto-rotation, or reset the view.
- System reduced-motion preferences are respected; the footer also has a persistent toggle.
- Offscreen rendering is skipped. Particle rendering is capped near 30fps and device pixel ratio at 1.75.
- Portfolio content and project links remain usable without canvas support. The project cards require JavaScript.

## Added cinematic interactions

The Gill-Editz reference inspired the interaction direction, implemented originally for this portfolio: floating project spotlights, pointer parallax, reflective buttons, a magnifying chapter dock, project-card tilt, a four-project guided tour, a pinned three-step build story, and a floating contact shortcut. No reference source or media assets were copied. The contact brief shows a local preview and prepares a mailto draft; it does not send messages or require a backend. Scroll-driven pinning is replaced with direct step buttons on phones and when motion is reduced.

## Content sources

Identity, education, LinkedIn, and project history were drawn from the owner's existing public GitHub portfolio source (`arashx1/portfolio`). Haven, Forensic Nexus, and Qiskit descriptions also reference their repository READMEs. This is a new implementation rather than a copy of the previously published portfolio. Existing project destinations may require login; check each before submitting.

## AWS Amplify deployment

`amplify.yml` builds the static output with no dependency installation. In AWS Amplify Hosting, connect the GitHub repository containing this version, choose the branch, and deploy using the included build settings. The published directory is `dist`. No runtime environment variables are required. Google Fonts is an optional external stylesheet; the site falls back to system fonts.

AWS has NOT been provisioned or deployed by this local build. After deployment, verify the live Amplify URL signed out on desktop and mobile, and keep it available throughout judging.

## Challenge submission checklist

- Confirm current official eligibility and full Rules tab restrictions.
- Publish the new portfolio to Amplify Hosting.
- Add the live AWS URL and the source repository URL to the hackathon project entry.
- Capture the hero, all three core content sections, mobile view, and all creative-feature states.
- Capture the real Amplify deployment and build settings; redact account IDs or sensitive details.
- Write an honest account of tools used, challenges, and lessons learned. Do not claim AWS services that were not used.
- Check LinkedIn, email, repository links, project dialogs, filters, keyboard operation, and reduced motion.

See `SUBMISSION.md` for a draft to complete using real deployment evidence.
