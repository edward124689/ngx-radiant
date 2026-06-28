# Ngx Radiant

Ngx Radiant is a modern Angular 21 lightbox library for polished image galleries and media previews. The goal is to offer a lightweight, Angular-native alternative inspired by Fancybox-style gallery experiences.

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

## Status

Early project scaffold. The first public API exposes:

- Angular 21 standalone component support
- Directive trigger support with `[ngxRadiant]`
- Image, video, and iframe item rendering, including YouTube embed URLs
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
    maxZoom: 3,
    showThumbnails: true,
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

```ts
readonly mediaItems: NgxRadiantItem[] = [
  {
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
