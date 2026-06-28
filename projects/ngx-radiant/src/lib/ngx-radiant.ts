import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type NgxRadiantItemType = 'image' | 'video' | 'iframe';

export interface NgxRadiantItem {
  src: string;
  type?: NgxRadiantItemType;
  alt?: string;
  caption?: string;
  thumb?: string;
}

export interface NgxRadiantConfig {
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
  iframeAspectRatio?: string;
  iframeAutoplay?: boolean;
  iframeMuted?: boolean;
}

const NGX_RADIANT_DEFAULT_CONFIG: Required<NgxRadiantConfig> = {
  ariaLabel: 'Image gallery lightbox',
  closeOnEscape: true,
  loop: true,
  showThumbnails: true,
  showCounter: true,
  showNavigation: true,
  zoomable: true,
  initialZoom: 1,
  minZoom: 1,
  maxZoom: 3,
  zoomStep: 0.25,
  showZoomSlider: false,
  iframeAspectRatio: '16 / 9',
  iframeAutoplay: false,
  iframeMuted: false,
};

@Component({
  selector: 'ngx-radiant-lightbox',
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ngx-radiant-host-open]': 'open()',
  },
  template: `
    @if (open()) {
      <div class="ngx-radiant" role="dialog" aria-modal="true" [attr.aria-label]="resolvedAriaLabel()">
        <button
          type="button"
          class="ngx-radiant__backdrop"
          aria-label="Close lightbox"
          (click)="close()"
        ></button>

        <div class="ngx-radiant__shell" (keydown)="handleKeydown($event)" tabindex="-1">
          <header class="ngx-radiant__toolbar">
            <div class="ngx-radiant__toolbar-start">
              @if (showCounterControl() && canNavigate()) {
                <div class="ngx-radiant__counter" aria-live="polite">
                  {{ currentIndex() + 1 }} / {{ items().length }}
                </div>
              }
            </div>

            <div class="ngx-radiant__toolbar-actions">
              @if (canZoom()) {
                <div class="ngx-radiant__zoom-controls" aria-label="Image zoom controls">
                  <button type="button" class="ngx-radiant__button" aria-label="Zoom out" (click)="zoomOut()">−</button>
                  <button type="button" class="ngx-radiant__zoom-value" aria-label="Reset zoom" (click)="resetZoom()">
                    {{ zoomPercent() }}%
                  </button>
                  <button type="button" class="ngx-radiant__button" aria-label="Zoom in" (click)="zoomIn()">+</button>
                  @if (showZoomSliderControl()) {
                    <label class="ngx-radiant__zoom-slider-label">
                      <span>Zoom</span>
                      <input
                        class="ngx-radiant__zoom-slider"
                        type="range"
                        [min]="resolvedMinZoom()"
                        [max]="resolvedMaxZoom()"
                        [step]="resolvedZoomStep()"
                        [value]="zoomLevel()"
                        aria-label="Zoom level"
                        (input)="setZoomFromInput($event)"
                      />
                    </label>
                  }
                </div>
              }

              <button type="button" class="ngx-radiant__button" aria-label="Close" (click)="close()">
                ×
              </button>
            </div>
          </header>

          @if (showNavigationControl() && canNavigate()) {
            <button
              type="button"
              class="ngx-radiant__nav ngx-radiant__nav--prev"
              aria-label="Previous item"
              (click)="previous()"
            >
              ‹
            </button>
          }

          <figure class="ngx-radiant__stage">
            @switch (currentItem().type ?? 'image') {
              @case ('video') {
                <video class="ngx-radiant__media" [src]="currentItem().src" controls playsinline></video>
              }
              @case ('iframe') {
                <iframe
                  class="ngx-radiant__frame"
                  [src]="trustedFrameSrc()"
                  [style.aspect-ratio]="resolvedIframeAspectRatio()"
                  title="Ngx Radiant embedded content"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              }
              @default {
                <img
                  class="ngx-radiant__media"
                  [style.transform]="zoomTransform()"
                  [class.ngx-radiant__media--zoomed]="zoomLevel() > 1"
                  [class.ngx-radiant__media--dragging]="dragging()"
                  [src]="currentItem().src"
                  [alt]="currentItem().alt ?? currentItem().caption ?? ''"
                  draggable="false"
                  (dblclick)="toggleZoom()"
                  (pointerdown)="startPan($event)"
                  (pointermove)="movePan($event)"
                  (pointerup)="endPan($event)"
                  (pointercancel)="endPan($event)"
                  (lostpointercapture)="endPan($event)"
                />
              }
            }

            @if (currentItem().caption) {
              <figcaption class="ngx-radiant__caption">{{ currentItem().caption }}</figcaption>
            }
          </figure>

          @if (showNavigationControl() && canNavigate()) {
            <button
              type="button"
              class="ngx-radiant__nav ngx-radiant__nav--next"
              aria-label="Next item"
              (click)="next()"
            >
              ›
            </button>
          }

          @if (resolvedShowThumbnails() && items().length > 1) {
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

    .ngx-radiant__toolbar-start,
    .ngx-radiant__toolbar-actions,
    .ngx-radiant__zoom-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ngx-radiant__zoom-slider-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid rgb(255 255 255 / 18%);
      border-radius: 999px;
      background: rgb(15 23 42 / 72%);
      padding: 0.35rem 0.65rem;
      box-shadow: 0 18px 50px rgb(0 0 0 / 28%);
      backdrop-filter: blur(14px);
    }

    .ngx-radiant__zoom-slider-label span {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ngx-radiant__zoom-slider {
      width: min(22vw, 12rem);
      accent-color: var(--ngx-radiant-accent, #67e8f9);
    }

    .ngx-radiant__toolbar-start {
      min-width: 0;
    }

    .ngx-radiant__toolbar-actions {
      margin-left: auto;
    }

    .ngx-radiant__counter,
    .ngx-radiant__button,
    .ngx-radiant__zoom-value,
    .ngx-radiant__nav {
      border: 1px solid rgb(255 255 255 / 18%);
      border-radius: 999px;
      background: rgb(15 23 42 / 72%);
      color: inherit;
      box-shadow: 0 18px 50px rgb(0 0 0 / 28%);
      backdrop-filter: blur(14px);
    }

    .ngx-radiant__counter,
    .ngx-radiant__zoom-value {
      padding: 0.55rem 0.9rem;
      font-size: 0.86rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ngx-radiant__button,
    .ngx-radiant__zoom-value,
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
      font-size: 1.35rem;
      line-height: 1;
    }

    .ngx-radiant__zoom-value {
      min-width: 4.4rem;
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
    .ngx-radiant__zoom-value:hover,
    .ngx-radiant__nav:hover,
    .ngx-radiant__thumb:hover {
      transform: translateY(-1px);
      background: rgb(30 41 59 / 86%);
    }

    .ngx-radiant__stage {
      grid-column: 2;
      grid-row: 2;
      display: grid;
      place-items: center;
      overflow: hidden;
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

    .ngx-radiant__media {
      transform-origin: center center;
      transition: transform 180ms ease;
    }

    .ngx-radiant__media--zoomed {
      cursor: grab;
      touch-action: none;
      user-select: none;
    }

    .ngx-radiant__media--dragging {
      cursor: grabbing;
      transition: none;
    }

    .ngx-radiant__frame {
      width: min(100%, 960px);
      height: auto;
      max-height: 100%;
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

      .ngx-radiant__toolbar {
        align-items: flex-start;
      }

      .ngx-radiant__toolbar-actions,
      .ngx-radiant__zoom-controls {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .ngx-radiant__zoom-slider {
        width: 8rem;
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
  readonly config = input<NgxRadiantConfig | null>(null);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly closeOnEscape = input<boolean | undefined>(undefined);
  readonly loop = input<boolean | undefined>(undefined);
  readonly showThumbnails = input<boolean | undefined>(undefined);
  readonly showCounter = input<boolean | undefined>(undefined);
  readonly showNavigation = input<boolean | undefined>(undefined);
  readonly zoomable = input<boolean | undefined>(undefined);
  readonly initialZoom = input<number | undefined>(undefined);
  readonly minZoom = input<number | undefined>(undefined);
  readonly maxZoom = input<number | undefined>(undefined);
  readonly zoomStep = input<number | undefined>(undefined);
  readonly showZoomSlider = input<boolean | undefined>(undefined);
  readonly iframeAspectRatio = input<string | undefined>(undefined);
  readonly iframeAutoplay = input<boolean | undefined>(undefined);
  readonly iframeMuted = input<boolean | undefined>(undefined);

  readonly open = input(false);
  readonly index = input(0);

  readonly openChange = output<boolean>();
  readonly indexChange = output<number>();
  readonly closed = output<void>();

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly zoomLevel = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly dragging = signal(false);
  private dragStart: { pointerId: number; x: number; y: number; panX: number; panY: number } | null = null;

  private readonly resolvedConfig = computed<Required<NgxRadiantConfig>>(() => {
    const config = this.config() ?? {};
    return {
      ...NGX_RADIANT_DEFAULT_CONFIG,
      ...config,
      ariaLabel: this.ariaLabel() ?? config.ariaLabel ?? NGX_RADIANT_DEFAULT_CONFIG.ariaLabel,
      closeOnEscape: this.closeOnEscape() ?? config.closeOnEscape ?? NGX_RADIANT_DEFAULT_CONFIG.closeOnEscape,
      loop: this.loop() ?? config.loop ?? NGX_RADIANT_DEFAULT_CONFIG.loop,
      showThumbnails: this.showThumbnails() ?? config.showThumbnails ?? NGX_RADIANT_DEFAULT_CONFIG.showThumbnails,
      showCounter: this.showCounter() ?? config.showCounter ?? NGX_RADIANT_DEFAULT_CONFIG.showCounter,
      showNavigation: this.showNavigation() ?? config.showNavigation ?? NGX_RADIANT_DEFAULT_CONFIG.showNavigation,
      zoomable: this.zoomable() ?? config.zoomable ?? NGX_RADIANT_DEFAULT_CONFIG.zoomable,
      initialZoom: this.initialZoom() ?? config.initialZoom ?? NGX_RADIANT_DEFAULT_CONFIG.initialZoom,
      minZoom: this.minZoom() ?? config.minZoom ?? NGX_RADIANT_DEFAULT_CONFIG.minZoom,
      maxZoom: this.maxZoom() ?? config.maxZoom ?? NGX_RADIANT_DEFAULT_CONFIG.maxZoom,
      zoomStep: this.zoomStep() ?? config.zoomStep ?? NGX_RADIANT_DEFAULT_CONFIG.zoomStep,
      showZoomSlider: this.showZoomSlider() ?? config.showZoomSlider ?? NGX_RADIANT_DEFAULT_CONFIG.showZoomSlider,
      iframeAspectRatio: this.iframeAspectRatio() ?? config.iframeAspectRatio ?? NGX_RADIANT_DEFAULT_CONFIG.iframeAspectRatio,
      iframeAutoplay: this.iframeAutoplay() ?? config.iframeAutoplay ?? NGX_RADIANT_DEFAULT_CONFIG.iframeAutoplay,
      iframeMuted: this.iframeMuted() ?? config.iframeMuted ?? NGX_RADIANT_DEFAULT_CONFIG.iframeMuted,
    };
  });

  protected readonly currentIndex = computed(() => this.normalizeIndex(this.index()));
  protected readonly currentItem = computed(() => this.items()[this.currentIndex()] ?? { src: '' });
  protected readonly canNavigate = computed(() => this.items().length > 1);
  protected readonly canZoom = computed(
    () => this.resolvedConfig().zoomable && (this.currentItem().type ?? 'image') === 'image',
  );
  protected readonly zoomPercent = computed(() => Math.round(this.zoomLevel() * 100));
  protected readonly zoomTransform = computed(() => `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoomLevel()})`);
  protected readonly resolvedMinZoom = computed(() => Math.max(this.resolvedConfig().minZoom, 0.1));
  protected readonly resolvedMaxZoom = computed(() => Math.max(this.resolvedConfig().maxZoom, this.resolvedMinZoom()));
  protected readonly resolvedZoomStep = computed(() => Math.max(this.resolvedConfig().zoomStep, 0.01));
  protected readonly resolvedIframeAspectRatio = computed(() => this.resolvedConfig().iframeAspectRatio);
  protected readonly trustedFrameSrc = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.resolveFrameSrc()),
  );
  protected readonly resolvedAriaLabel = computed(() => this.resolvedConfig().ariaLabel);
  protected readonly resolvedShowThumbnails = computed(() => this.resolvedConfig().showThumbnails);
  protected readonly showCounterControl = computed(() => this.resolvedConfig().showCounter);
  protected readonly showNavigationControl = computed(() => this.resolvedConfig().showNavigation);
  protected readonly showZoomSliderControl = computed(() => this.resolvedConfig().showZoomSlider);

  constructor() {
    effect(() => {
      this.open();
      this.currentIndex();
      this.currentItem().src;
      const config = this.resolvedConfig();
      this.zoomLevel.set(this.clampZoom(config.initialZoom));
      this.resetPan();
    });
  }

  openAt(index: number): void {
    this.indexChange.emit(this.normalizeIndex(index));
    this.openChange.emit(this.items().length > 0);
  }

  close(): void {
    if (!this.open()) {
      return;
    }

    this.openChange.emit(false);
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
    const nextIndex = this.resolvedConfig().loop
      ? (index + itemCount) % itemCount
      : Math.min(Math.max(index, 0), itemCount - 1);

    this.indexChange.emit(nextIndex);
  }

  zoomIn(): void {
    if (!this.canZoom()) {
      return;
    }

    this.setZoom(this.zoomLevel() + this.resolvedZoomStep());
  }

  zoomOut(): void {
    if (!this.canZoom()) {
      return;
    }

    this.setZoom(this.zoomLevel() - this.resolvedZoomStep());
  }

  resetZoom(): void {
    this.zoomLevel.set(this.clampZoom(this.resolvedConfig().initialZoom));
    this.resetPan();
  }

  setZoomFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setZoom(Number(input.value));
  }

  setZoom(zoom: number): void {
    const nextZoom = this.clampZoom(zoom);
    this.zoomLevel.set(nextZoom);
    if (nextZoom <= this.resolvedMinZoom()) {
      this.resetPan();
      return;
    }

    this.clampCurrentPan();
  }

  toggleZoom(): void {
    if (!this.canZoom()) {
      return;
    }

    this.setZoom(this.zoomLevel() > this.resolvedMinZoom() ? this.resolvedMinZoom() : this.resolvedMaxZoom());
  }

  startPan(event: PointerEvent): void {
    if (!this.canPan()) {
      return;
    }

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragStart = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: this.panX(),
      panY: this.panY(),
    };
    this.dragging.set(true);
  }

  movePan(event: PointerEvent): void {
    if (!this.dragStart || this.dragStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const bounds = this.getPanBounds(event.currentTarget as HTMLElement);
    this.panX.set(this.clamp(this.dragStart.panX + event.clientX - this.dragStart.x, -bounds.x, bounds.x));
    this.panY.set(this.clamp(this.dragStart.panY + event.clientY - this.dragStart.y, -bounds.y, bounds.y));
  }

  endPan(event: PointerEvent): void {
    if (this.dragStart?.pointerId === event.pointerId) {
      this.dragStart = null;
      this.dragging.set(false);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.resolvedConfig().closeOnEscape) {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
      return;
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      this.zoomOut();
      return;
    }

    if (event.key === '0') {
      event.preventDefault();
      this.resetZoom();
    }
  }

  private resolveFrameSrc(): string {
    const config = this.resolvedConfig();
    if (!config.iframeAutoplay && !config.iframeMuted) {
      return this.currentItem().src;
    }

    try {
      const url = new URL(this.currentItem().src, globalThis.location?.origin ?? 'http://localhost');
      if (config.iframeAutoplay) {
        url.searchParams.set('autoplay', '1');
      }
      if (config.iframeMuted) {
        url.searchParams.set('mute', '1');
        url.searchParams.set('muted', '1');
      }
      return url.toString();
    } catch {
      return this.currentItem().src;
    }
  }

  private clampCurrentPan(): void {
    if (!this.open()) {
      return;
    }

    const media = document.querySelector('.ngx-radiant__media') as HTMLElement | null;
    if (!media) {
      return;
    }

    const bounds = this.getPanBounds(media);
    this.panX.set(this.clamp(this.panX(), -bounds.x, bounds.x));
    this.panY.set(this.clamp(this.panY(), -bounds.y, bounds.y));
  }

  private getPanBounds(media: HTMLElement): { x: number; y: number } {
    const stage = media.parentElement as HTMLElement | null;
    const zoom = this.zoomLevel();
    const mediaWidth = media.clientWidth || media.getBoundingClientRect().width;
    const mediaHeight = media.clientHeight || media.getBoundingClientRect().height;
    const stageWidth = stage?.clientWidth || mediaWidth;
    const stageHeight = stage?.clientHeight || mediaHeight;
    return {
      x: Math.max((mediaWidth * zoom - stageWidth) / 2, 0),
      y: Math.max((mediaHeight * zoom - stageHeight) / 2, 0),
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private normalizeIndex(index: number): number {
    const itemCount = this.items().length;
    if (itemCount === 0) {
      return 0;
    }

    return Math.min(Math.max(Math.trunc(index) || 0, 0), itemCount - 1);
  }

  private clampZoom(zoom: number): number {
    const minZoom = this.resolvedMinZoom();
    const maxZoom = this.resolvedMaxZoom();
    return Math.min(Math.max(Number.isFinite(zoom) ? zoom : this.resolvedConfig().initialZoom, minZoom), maxZoom);
  }

  private canPan(): boolean {
    return this.canZoom() && this.zoomLevel() > this.resolvedMinZoom();
  }

  private resetPan(): void {
    this.panX.set(0);
    this.panY.set(0);
    this.dragStart = null;
    this.dragging.set(false);
  }
}
