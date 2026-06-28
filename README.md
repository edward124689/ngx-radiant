# Ngx Radiant

[![npm version](https://img.shields.io/npm/v/ngx-radiant.svg)](https://www.npmjs.com/package/ngx-radiant)
[![npm downloads](https://img.shields.io/npm/dm/ngx-radiant.svg)](https://www.npmjs.com/package/ngx-radiant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Ngx Radiant is an Angular 21+ lightbox and image gallery library for polished media previews. It ships standalone Angular components and directive triggers for responsive galleries, image zoom, thumbnails, captions, keyboard navigation, video previews, fullscreen toolbar controls, download/open-original actions, and iframe/YouTube embeds.

## Demo

The GitHub Pages demo is deployed from `main` by GitHub Actions:

```text
https://edward124689.github.io/ngx-radiant/
```

Local demo commands:

```bash
npm start
npm run build:pages
```

## Version and compatibility

- Library version: `21.1.0`
- Angular compatibility: `21+`
- Package format: standalone Angular library with partial compilation

## Features

- Angular 21+ standalone component support
- Directive trigger support with `[ngxRadiant]`
- Image, video, and iframe item rendering, including YouTube embed URLs
- Mobile swipe navigation, pinch zoom, and double-tap zoom
- Lazy thumbnail loading and configurable nearby image preloading
- Fullscreen, download, open-original, and configurable toolbar actions
- Focus trap and restore-focus accessibility behavior
- Zoom in/out/reset controls for image items
- Config object support via `[config]` and `[radiantConfig]`
- Captions, counters, thumbnails, backdrop close
- Single-item overlays automatically hide counter and previous/next navigation
- Keyboard navigation: `Escape`, `ArrowLeft`, `ArrowRight`, `+`, `-`, `0`
- Two-way-compatible `open` / `openChange` and `index` / `indexChange` bindings
- CSS custom properties for basic theming

## Workspace

```bash
npm install
npm run build:lib
npm test -- --watch=false
npm pack --dry-run ./dist/ngx-radiant
```

The publishable library lives in:

```text
projects/ngx-radiant
```

Production build output is generated at:

```text
dist/ngx-radiant
```

## Component usage

```ts
import { Component, signal } from '@angular/core';
import { NgxRadiantConfig, NgxRadiantItem, NgxRadiantLightbox } from 'ngx-radiant';

@Component({
  selector: 'app-gallery',
  imports: [NgxRadiantLightbox],
  template: `
    <button type="button" (click)="isOpen.set(true)">Open gallery</button>

    <ngx-radiant-lightbox
      [items]="items"
      [open]="isOpen()"
      (openChange)="isOpen.set($event)"
      [index]="activeIndex()"
      (indexChange)="activeIndex.set($event)"
      [config]="config"
    />
  `,
})
export class GalleryComponent {
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);
  readonly config: NgxRadiantConfig = {
    zoomStep: 0.5,
    maxZoom: 8,
    showZoomSlider: true,
    showThumbnails: true,
    swipeNavigation: true,
    pinchZoom: true,
    preloadImages: true,
    showFullscreenButton: true,
    showDownload: true,
    showOpenOriginal: true,
  };

  readonly items: NgxRadiantItem[] = [
    {
      src: '/assets/gallery/aurora.jpg',
      thumb: '/assets/gallery/aurora-thumb.jpg',
      alt: 'Aurora over a mountain ridge',
      caption: 'Aurora over a mountain ridge',
    },
  ];
}
```

## Directive usage

Use the directive when any element should open a lightbox without manually rendering the component.

```ts
import { Component } from '@angular/core';
import { NgxRadiantDirective, NgxRadiantItem } from 'ngx-radiant';

@Component({
  selector: 'app-gallery',
  imports: [NgxRadiantDirective],
  template: `
    <button type="button" [ngxRadiant]="items" [radiantIndex]="0">
      Open gallery
    </button>

    <img
      src="/assets/gallery/aurora-thumb.jpg"
      alt="Aurora thumbnail"
      [ngxRadiant]="items"
      [radiantIndex]="0"
    />
  `,
})
export class GalleryComponent {
  readonly items: NgxRadiantItem[] = [
    {
      src: '/assets/gallery/aurora.jpg',
      thumb: '/assets/gallery/aurora-thumb.jpg',
      alt: 'Aurora over a mountain ridge',
      caption: 'Aurora over a mountain ridge',
    },
  ];
}
```

Images can zoom beyond the fitted viewport. When zoomed in, users can drag the image to inspect details. On touch devices, users can swipe between gallery items, pinch to zoom, and double-tap image items to jump between min/max zoom.

Single-image shorthand automatically hides the counter and previous/next controls:

```html
<button
  type="button"
  ngxRadiant="/assets/gallery/aurora.jpg"
  radiantAlt="Aurora over a mountain ridge"
  radiantCaption="Aurora over a mountain ridge"
  [radiantConfig]="{ zoomStep: 0.5, maxZoom: 3 }"
>
  Open image
</button>
```

Iframe / YouTube example:

> Iframe sources must be application-controlled. Ngx Radiant only allows `http:`/`https:` iframe URLs by default, but empty `iframeAllowedOrigins` means any HTTP(S) origin can render. If iframe data can come from a CMS, database, API response, or user-controlled content, set `iframeAllowedOrigins` to a strict provider list such as `['https://www.youtube.com']`. Autoplay does not enable muted mode automatically; set `iframeMuted: true` only when you want muted autoplay params.

```ts
readonly mediaItems: NgxRadiantItem[] = [
  {
    src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
    type: 'iframe',
    caption: 'YouTube embed',
  },
];
```

```html
<button
  type="button"
  [ngxRadiant]="mediaItems"
  [radiantConfig]="{
    showCounter: false,
    showNavigation: false,
    zoomable: false,
    iframeAllowedOrigins: ['https://www.youtube.com']
  }"
>
  Open YouTube
</button>
```


## Toolbar actions

Use `toolbarActions` to choose which built-in controls are visible. Enable optional actions with the matching config flag.

```ts
const config: NgxRadiantConfig = {
  showFullscreenButton: true,
  showDownload: true,
  showOpenOriginal: true,
  toolbarActions: ['zoomOut', 'resetZoom', 'zoomIn', 'fullscreen', 'download', 'openOriginal', 'close'],
};

const items: NgxRadiantItem[] = [
  {
    src: '/assets/gallery/aurora.jpg',
    caption: 'Aurora over a mountain ridge',
    downloadName: 'aurora.jpg',
  },
];
```

The dialog traps keyboard focus while open and restores focus to the trigger when it closes by default.

Download and open-original actions only run for relative URLs or `http:`/`https:` URLs. Other protocols are ignored for safer defaults.

## API preview

### `NgxRadiantLightbox`

| Input/output | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `NgxRadiantItem[]` | `[]` | Gallery items to display. |
| `open` / `openChange` | `boolean` | `false` | Controls visibility. |
| `index` / `indexChange` | `number` | `0` | Controls the selected item. |
| `config` | `NgxRadiantConfig` | `null` | Shared config object for controls, zoom, and UI visibility. |
| `ariaLabel` | `string` | `Image gallery lightbox` | Accessible dialog label. Overrides `config.ariaLabel`. |
| `closeOnEscape` | `boolean` | `true` | Close the lightbox when Escape is pressed. Overrides `config.closeOnEscape`. |
| `loop` | `boolean` | `true` | Wrap navigation at the first/last item. Overrides `config.loop`. |
| `showThumbnails` | `boolean` | `true` | Render the thumbnail strip when possible. Overrides `config.showThumbnails`. |
| `showCounter` | `boolean` | `true` | Render the counter when there is more than one item. Overrides `config.showCounter`. |
| `showNavigation` | `boolean` | `true` | Render previous/next controls when there is more than one item. Overrides `config.showNavigation`. |
| `zoomable` | `boolean` | `true` | Enable zoom controls for image items. Overrides `config.zoomable`. |
| `initialZoom` | `number` | `1` | Initial image zoom level. Overrides `config.initialZoom`. |
| `minZoom` | `number` | `1` | Minimum image zoom level. Overrides `config.minZoom`. |
| `maxZoom` | `number` | `3` | Maximum image zoom level. Overrides `config.maxZoom`. |
| `zoomStep` | `number` | `0.25` | Amount changed by each zoom in/out action. Overrides `config.zoomStep`. |
| `showZoomSlider` | `boolean` | `false` | Render a range slider for direct zoom control. Overrides `config.showZoomSlider`. |
| `swipeNavigation` | `boolean` | `true` | Enable horizontal swipe navigation on image galleries. Overrides `config.swipeNavigation`. |
| `swipeThreshold` | `number` | `48` | Minimum horizontal swipe distance in pixels. Overrides `config.swipeThreshold`. |
| `pinchZoom` | `boolean` | `true` | Enable two-finger pinch zoom on image items. Overrides `config.pinchZoom`. |
| `doubleTapZoom` | `boolean` | `true` | Enable mobile double-tap zoom toggling on image items. Overrides `config.doubleTapZoom`. |
| `lazyLoad` | `boolean` | `true` | Lazy-load thumbnails and mark the active image as eager. Overrides `config.lazyLoad`. |
| `preloadImages` | `boolean` | `true` | Preload nearby image items for faster navigation. Overrides `config.preloadImages`. |
| `preloadRadius` | `number` | `1` | Number of previous/next image items to preload. Overrides `config.preloadRadius`. |
| `toolbarActions` | `NgxRadiantToolbarAction[]` | built-in action list | Choose which toolbar actions are visible. Overrides `config.toolbarActions`. |
| `fullscreen` | `boolean` | `true` | Enable Fullscreen API support. Overrides `config.fullscreen`. |
| `showFullscreenButton` | `boolean` | `true` | Render the fullscreen toolbar action when supported. Overrides `config.showFullscreenButton`. |
| `showDownload` | `boolean` | `false` | Render the download toolbar action. Overrides `config.showDownload`. |
| `showOpenOriginal` | `boolean` | `false` | Render the open-original toolbar action. Overrides `config.showOpenOriginal`. |
| `trapFocus` | `boolean` | `true` | Keep Tab focus inside the open dialog. Overrides `config.trapFocus`. |
| `restoreFocus` | `boolean` | `true` | Restore focus to the previous active element on close. Overrides `config.restoreFocus`. |
| `iframeAspectRatio` | `string` | `'16 / 9'` | CSS aspect-ratio for iframe embeds. Overrides `config.iframeAspectRatio`. |
| `iframeAutoplay` | `boolean` | `false` | Appends `autoplay=1` to iframe URLs. Overrides `config.iframeAutoplay`. |
| `iframeMuted` | `boolean` | `false` | Appends `mute=1&muted=1` only when explicitly enabled. Overrides `config.iframeMuted`. |
| `iframeAllowedOrigins` | `string[]` | `[]` | Optional iframe origin allowlist. Empty means any `http:`/`https:` origin is allowed; unsupported protocols render `about:blank`. |

### `NgxRadiantDirective`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `ngxRadiant` | `NgxRadiantItem \| NgxRadiantItem[] \| string` | `null` | Item, item list, or single image URL to open. |
| `radiantItems` | `NgxRadiantItem[]` | `null` | Optional explicit gallery items. |
| `radiantIndex` | `number` | `0` | Initial item index. |
| `radiantAlt` | `string` | `undefined` | Alt text for string shorthand. |
| `radiantCaption` | `string` | `undefined` | Caption for string shorthand. |
| `radiantThumb` | `string` | `undefined` | Thumbnail for string shorthand. |
| `radiantType` | `'image' \| 'video' \| 'iframe'` | `undefined` | Media type for string shorthand. |
| `radiantAriaLabel` | `string` | `Image gallery lightbox` | Accessible dialog label. |
| `radiantConfig` | `NgxRadiantConfig` | `null` | Shared config object passed to the created lightbox. |
| `radiantCloseOnEscape` | `boolean` | `true` | Close the overlay when Escape is pressed. |
| `radiantLoop` | `boolean` | `true` | Wrap navigation at the first/last item. |
| `radiantShowThumbnails` | `boolean` | `true` | Render the thumbnail strip when possible. |

### `NgxRadiantConfig`

```ts
interface NgxRadiantConfig {
  ariaLabel?: string;
  closeOnEscape?: boolean;
  loop?: boolean;
  showThumbnails?: boolean;
  showCounter?: boolean;
  showNavigation?: boolean;
  zoomable?: boolean;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  showZoomSlider?: boolean;
  swipeNavigation?: boolean;
  swipeThreshold?: number;
  pinchZoom?: boolean;
  doubleTapZoom?: boolean;
  lazyLoad?: boolean;
  preloadImages?: boolean;
  preloadRadius?: number;
  toolbarActions?: NgxRadiantToolbarAction[];
  fullscreen?: boolean;
  showFullscreenButton?: boolean;
  showDownload?: boolean;
  showOpenOriginal?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  iframeAspectRatio?: string;
  iframeAutoplay?: boolean;
  iframeMuted?: boolean;
  iframeAllowedOrigins?: string[];
}
```

### `NgxRadiantItem`

```ts
interface NgxRadiantItem {
  src: string;
  type?: 'image' | 'video' | 'iframe';
  alt?: string;
  caption?: string;
  thumb?: string;
  downloadName?: string;
}
```

## Theming

```css
:root {
  --ngx-radiant-z-index: 1000;
  --ngx-radiant-accent: #67e8f9;
}
```

## Publishing checklist

```bash
npm run build:lib
cd dist/ngx-radiant
npm publish --access public
```

Do not publish until the package name, license, README, and npm account access are confirmed.
