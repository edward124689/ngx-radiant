# ngx-radiant

A modern Angular 21 lightbox library for image galleries and media previews.

## Demo

```text
https://edward124689.github.io/ngx-radiant/
```

## Install

```bash
npm install ngx-radiant
```

## Usage

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

## API

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

## Commands

```bash
npm run build:lib
npm test -- --watch=false
```
