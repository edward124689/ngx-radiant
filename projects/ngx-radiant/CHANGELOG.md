# Changelog

All notable changes to Ngx Radiant are documented in this file.

## 21.1.0 - 2026-06-28

### Added

- Mobile horizontal swipe navigation for image galleries.
- Pinch zoom and mobile double-tap zoom for image items.
- Lazy-loaded thumbnail images and configurable nearby image preloading.
- New config options: `swipeNavigation`, `swipeThreshold`, `pinchZoom`, `doubleTapZoom`, `lazyLoad`, `preloadImages`, and `preloadRadius`.
- Fullscreen toolbar action powered by the browser Fullscreen API.
- Download and open-original toolbar actions, including optional per-item `downloadName`.
- Configurable `toolbarActions` plus focus trap and restore-focus accessibility behavior.

## 21.0.0 - 2026-06-28

### Added

- Initial public Angular 21+ standalone lightbox library release.
- `NgxRadiantLightbox` component with controlled `open/openChange` and `index/indexChange` bindings.
- `NgxRadiantDirective` trigger API for opening galleries or single images from any element.
- Image, video, and iframe item support, including YouTube embed URLs.
- Configurable iframe behavior:
  - `iframeAspectRatio`, defaulting to `16 / 9`.
  - `iframeAutoplay`, which appends `autoplay=1` without forcing muted mode.
  - `iframeMuted`, which appends `mute=1&muted=1` only when explicitly enabled.
  - `iframeAllowedOrigins` for optional iframe origin allowlisting.
- Image zoom controls with zoom in/out/reset, optional zoom slider, and bounded drag/pan while zoomed.
- Automatic hiding of counter and previous/next navigation for single-item overlays.
- Captions, counters, thumbnails, backdrop close, keyboard navigation, and CSS custom properties for theming.
- GitHub Pages demo covering component usage, directive usage, single-image usage, zoom, and iframe media.

### Security

- Iframe URLs are validated before being trusted as Angular resource URLs.
- Unsupported iframe protocols and disallowed origins render `about:blank`.
