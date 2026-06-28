import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';

export type NgxRadiantItemType = 'image' | 'video' | 'iframe';

export interface NgxRadiantItem {
  src: string;
  type?: NgxRadiantItemType;
  alt?: string;
  caption?: string;
  thumb?: string;
}

@Component({
  selector: 'ngx-radiant-lightbox',
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ngx-radiant-host-open]': 'open()',
  },
  template: `
    @if (open()) {
      <div class="ngx-radiant" role="dialog" aria-modal="true" [attr.aria-label]="ariaLabel()">
        <button
          type="button"
          class="ngx-radiant__backdrop"
          aria-label="Close lightbox"
          (click)="close()"
        ></button>

        <div class="ngx-radiant__shell" (keydown)="handleKeydown($event)" tabindex="-1">
          <header class="ngx-radiant__toolbar">
            <div class="ngx-radiant__counter" aria-live="polite">
              {{ currentIndex() + 1 }} / {{ items().length }}
            </div>
            <button type="button" class="ngx-radiant__button" aria-label="Close" (click)="close()">
              ×
            </button>
          </header>

          <button
            type="button"
            class="ngx-radiant__nav ngx-radiant__nav--prev"
            aria-label="Previous item"
            [disabled]="!canNavigate()"
            (click)="previous()"
          >
            ‹
          </button>

          <figure class="ngx-radiant__stage">
            @switch (currentItem().type ?? 'image') {
              @case ('video') {
                <video class="ngx-radiant__media" [src]="currentItem().src" controls playsinline></video>
              }
              @case ('iframe') {
                <iframe class="ngx-radiant__frame" [src]="currentItem().src" title="Ngx Radiant content"></iframe>
              }
              @default {
                <img
                  class="ngx-radiant__media"
                  [src]="currentItem().src"
                  [alt]="currentItem().alt ?? currentItem().caption ?? ''"
                  draggable="false"
                />
              }
            }

            @if (currentItem().caption) {
              <figcaption class="ngx-radiant__caption">{{ currentItem().caption }}</figcaption>
            }
          </figure>

          <button
            type="button"
            class="ngx-radiant__nav ngx-radiant__nav--next"
            aria-label="Next item"
            [disabled]="!canNavigate()"
            (click)="next()"
          >
            ›
          </button>

          @if (showThumbnails() && items().length > 1) {
            <footer class="ngx-radiant__thumbs" aria-label="Lightbox thumbnails">
              @for (item of items(); track item.src; let index = $index) {
                <button
                  type="button"
                  class="ngx-radiant__thumb"
                  [ngClass]="{ 'ngx-radiant__thumb--active': index === currentIndex() }"
                  [attr.aria-label]="'Open item ' + (index + 1)"
                  [attr.aria-current]="index === currentIndex() ? 'true' : null"
                  (click)="goTo(index)"
                >
                  <img [src]="item.thumb ?? item.src" [alt]="item.alt ?? ''" />
                </button>
              }
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: contents;
    }

    .ngx-radiant {
      position: fixed;
      inset: 0;
      z-index: var(--ngx-radiant-z-index, 1000);
      display: grid;
      place-items: center;
      color: #fff;
      font-family:
        Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .ngx-radiant__backdrop {
      position: absolute;
      inset: 0;
      border: 0;
      background: color-mix(in srgb, #020617 88%, transparent);
      cursor: zoom-out;
    }

    .ngx-radiant__shell {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: min(94vw, 1180px);
      height: min(92vh, 840px);
      gap: 1rem;
      outline: none;
    }

    .ngx-radiant__toolbar {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .ngx-radiant__counter,
    .ngx-radiant__button,
    .ngx-radiant__nav {
      border: 1px solid rgb(255 255 255 / 18%);
      border-radius: 999px;
      background: rgb(15 23 42 / 72%);
      color: inherit;
      box-shadow: 0 18px 50px rgb(0 0 0 / 28%);
      backdrop-filter: blur(14px);
    }

    .ngx-radiant__counter {
      padding: 0.55rem 0.9rem;
      font-size: 0.86rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ngx-radiant__button,
    .ngx-radiant__nav {
      cursor: pointer;
      transition:
        transform 160ms ease,
        background 160ms ease,
        opacity 160ms ease;
    }

    .ngx-radiant__button {
      width: 2.6rem;
      height: 2.6rem;
      font-size: 1.6rem;
      line-height: 1;
    }

    .ngx-radiant__nav {
      align-self: center;
      width: 3rem;
      height: 3rem;
      border: 0;
      font-size: 2.6rem;
      line-height: 1;
    }

    .ngx-radiant__button:hover,
    .ngx-radiant__nav:hover:not(:disabled),
    .ngx-radiant__thumb:hover {
      transform: translateY(-1px);
      background: rgb(30 41 59 / 86%);
    }

    .ngx-radiant__nav:disabled {
      cursor: default;
      opacity: 0.4;
    }

    .ngx-radiant__stage {
      grid-column: 2;
      grid-row: 2;
      display: grid;
      place-items: center;
      min-width: 0;
      min-height: 0;
      margin: 0;
    }

    .ngx-radiant__media,
    .ngx-radiant__frame {
      max-width: 100%;
      max-height: 100%;
      border: 0;
      border-radius: 1.25rem;
      background: #020617;
      box-shadow: 0 28px 80px rgb(0 0 0 / 42%);
    }

    .ngx-radiant__frame {
      width: min(100%, 960px);
      height: min(100%, 640px);
    }

    .ngx-radiant__caption {
      justify-self: center;
      max-width: min(80ch, 84vw);
      margin-top: 0.85rem;
      padding: 0.6rem 0.9rem;
      border-radius: 999px;
      background: rgb(15 23 42 / 68%);
      color: rgb(226 232 240);
      text-align: center;
      backdrop-filter: blur(12px);
    }

    .ngx-radiant__thumbs {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.25rem;
    }

    .ngx-radiant__thumb {
      width: 4rem;
      height: 3rem;
      flex: 0 0 auto;
      overflow: hidden;
      border: 1px solid rgb(255 255 255 / 14%);
      border-radius: 0.7rem;
      background: rgb(15 23 42 / 70%);
      cursor: pointer;
      opacity: 0.68;
      padding: 0;
      transition: 160ms ease;
    }

    .ngx-radiant__thumb--active {
      border-color: var(--ngx-radiant-accent, #67e8f9);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ngx-radiant-accent, #67e8f9) 30%, transparent);
      opacity: 1;
    }

    .ngx-radiant__thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    @media (max-width: 720px) {
      .ngx-radiant__shell {
        width: 96vw;
        height: 94vh;
        grid-template-columns: 1fr 1fr;
      }

      .ngx-radiant__stage {
        grid-column: 1 / -1;
      }

      .ngx-radiant__nav {
        grid-row: 3;
        justify-self: center;
      }

      .ngx-radiant__nav--prev {
        grid-column: 1;
      }

      .ngx-radiant__nav--next {
        grid-column: 2;
      }

      .ngx-radiant__thumbs {
        display: none;
      }
    }
  `,
})
export class NgxRadiantLightbox {
  readonly items = input<NgxRadiantItem[]>([]);
  readonly ariaLabel = input('Image gallery lightbox');
  readonly closeOnEscape = input(true);
  readonly loop = input(true);
  readonly showThumbnails = input(true);

  readonly open = model(false);
  readonly index = model(0);

  readonly closed = output<void>();

  protected readonly currentIndex = computed(() => this.normalizeIndex(this.index()));
  protected readonly currentItem = computed(() => this.items()[this.currentIndex()]);
  protected readonly canNavigate = computed(() => this.items().length > 1);

  constructor() {
    effect(() => {
      const normalized = this.normalizeIndex(this.index());
      if (normalized !== this.index()) {
        this.index.set(normalized);
      }

      if (this.open() && this.items().length === 0) {
        this.open.set(false);
      }
    });
  }

  openAt(index: number): void {
    this.index.set(this.normalizeIndex(index));
    this.open.set(this.items().length > 0);
  }

  close(): void {
    if (!this.open()) {
      return;
    }

    this.open.set(false);
    this.closed.emit();
  }

  next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  previous(): void {
    this.goTo(this.currentIndex() - 1);
  }

  goTo(index: number): void {
    if (!this.canNavigate()) {
      return;
    }

    const itemCount = this.items().length;
    if (this.loop()) {
      this.index.set((index + itemCount) % itemCount);
      return;
    }

    this.index.set(Math.min(Math.max(index, 0), itemCount - 1));
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape()) {
      event.preventDefault();
      this.close();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    }
  }

  private normalizeIndex(index: number): number {
    const itemCount = this.items().length;
    if (itemCount === 0) {
      return 0;
    }

    return Math.min(Math.max(Math.trunc(index) || 0, 0), itemCount - 1);
  }
}
