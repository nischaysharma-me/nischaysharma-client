# Responsive interaction audit

This audit defines the supported responsive baseline for the public site and admin application. It focuses on reachability and interaction—not only whether a layout looks correct.

## Viewport matrix

| Target | CSS viewport used | Primary risk covered |
| --- | ---: | --- |
| Compact 6-inch phone | 320 × 568 | very narrow and short screen |
| Redmi 6A | 360 × 720 | common Android phone viewport |
| Modern 6–7-inch phone | 393 × 852 | tall phone and safe-area behavior |
| 7-inch large phone | 480 × 960 | large phone / small tablet transition |
| Tablet portrait | 768 × 1024 | mobile-to-desktop breakpoint |
| Tablet landscape | 1024 × 768 | sidebar and multi-column transition |
| 13.6-inch laptop | 1366 × 768 | standard laptop viewport |
| Short/scaled laptop | 1366 × 625 | Windows scaling and reduced usable height |

## Coverage

Public routes checked include the homepage, about, article index, article detail, post feed, documentation, and admin login. The authenticated admin route inventory includes dashboard, articles, article editor, LinkedIn composer, posts, books, billboard, profile, prompt library, settings, stack, templates, and threads.

Overlay and modal coverage includes the navigation billboard, stack menu, generic card modals, content generators, profile editors, LinkedIn composer, and chat image preview.

## Acceptance criteria

- No horizontal document overflow at the supported widths.
- Interactive controls have a minimum 44 × 44 CSS pixel target on narrow or coarse-pointer devices.
- Text inputs use at least 16px text on phones to avoid automatic browser zoom.
- Full-screen layouts use dynamic viewport units and retain a `100vh` fallback.
- Fixed overlays scroll independently and account for device safe areas.
- Admin content owns all space below its mobile header; controls are not hidden below the viewport.
- Dense modal grids collapse to a single column on phones.
- Icon-only actions expose an accessible name.

## Implementation notes

The global responsive baseline lives in `styles/base/_responsive.sass`. Feature-level exceptions remain close to their components so that short-height behavior can be tuned without weakening desktop layouts.

Public pages and the login flow can be exercised without authentication. Authenticated admin screens must also be checked in a signed-in browser before a release when their data-dependent states change; the shared dashboard, modal, control, viewport, and safe-area rules apply to those routes consistently.

