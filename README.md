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

Early project scaffold. The first public API exposes a standalone lightbox component with:

- Angular 21 standalone component support
- Image and video item rendering
- Captions, counters, thumbnails, backdrop close
- Keyboard navigation: `Escape`, `ArrowLeft`, `ArrowRight`
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

## Basic usage

```ts
import { Component, signal } from '@angular/core';
import { NgxRadiantItem, NgxRadiantLightbox } from 'ngx-radiant';

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
    />
  `,
})
export class GalleryComponent {
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);
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

## API preview

### `NgxRadiantLightbox`

| Input/output | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `NgxRadiantItem[]` | `[]` | Gallery items to display. |
| `open` / `openChange` | `boolean` | `false` | Controls visibility. |
| `index` / `indexChange` | `number` | `0` | Controls the selected item. |
| `ariaLabel` | `string` | `Image gallery lightbox` | Accessible dialog label. |
| `closeOnEscape` | `boolean` | `true` | Close the lightbox when Escape is pressed. |
| `loop` | `boolean` | `true` | Wrap navigation at the first/last item. |
| `showThumbnails` | `boolean` | `true` | Render the thumbnail strip when possible. |

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
