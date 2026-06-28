# ngx-radiant

[![npm version](https://img.shields.io/npm/v/ngx-radiant.svg)](https://www.npmjs.com/package/ngx-radiant)
[![npm downloads](https://img.shields.io/npm/dm/ngx-radiant.svg)](https://www.npmjs.com/package/ngx-radiant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/edward124689/ngx-radiant/blob/main/LICENSE)

Angular 21+ lightbox gallery library with directive triggers, image zoom, thumbnails, captions, keyboard navigation, video previews, and iframe/YouTube embeds.

## Mobile and performance defaults

Ngx Radiant enables swipe navigation, pinch zoom, double-tap zoom, lazy thumbnail loading, and nearby image preloading by default. Disable or tune them through `NgxRadiantConfig` when an app needs stricter behavior.

## Demo

```text
https://edward124689.github.io/ngx-radiant/
```

## Install

```bash
npm install ngx-radiant
```

## Compatibility

- Library version: `21.1.0`
- Angular compatibility: `21+`

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

> Iframe sources must be application-controlled. Ngx Radiant only allows `http:`/`https:` iframe URLs by default. Use `iframeAllowedOrigins` when you want a stricter allowlist. Autoplay does not enable muted mode automatically; set `iframeMuted: true` only when you want muted autoplay params.

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
  [radiantConfig]="{ showCounter: false, showNavigation: false, zoomable: false }"
>
  Open YouTube
</button>
```

## API

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
}
```

## Commands

```bash
npm run build:lib
npm test -- --watch=false
```
