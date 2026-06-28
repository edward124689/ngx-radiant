import { DOCUMENT, NgClass, isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type NgxRadiantItemType = 'image' | 'video' | 'iframe';
export type NgxRadiantToolbarAction =
  | 'zoomOut'
  | 'resetZoom'
  | 'zoomIn'
  | 'fullscreen'
  | 'download'
  | 'openOriginal'
  | 'close';

export interface NgxRadiantItem {
  src: string;
  type?: NgxRadiantItemType;
  alt?: string;
  caption?: string;
  thumb?: string;
  downloadName?: string;
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
  swipeNavigation: true,
  swipeThreshold: 48,
  pinchZoom: true,
  doubleTapZoom: true,
  lazyLoad: true,
  preloadImages: true,
  preloadRadius: 1,
  toolbarActions: ['zoomOut', 'resetZoom', 'zoomIn', 'fullscreen', 'download', 'openOriginal', 'close'],
  fullscreen: true,
  showFullscreenButton: true,
  showDownload: false,
  showOpenOriginal: false,
  trapFocus: true,
  restoreFocus: true,
  iframeAspectRatio: '16 / 9',
  iframeAutoplay: false,
  iframeMuted: false,
  iframeAllowedOrigins: [],
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

        <div #shell class="ngx-radiant__shell" (keydown)="handleKeydown($event)" tabindex="-1">
          <header class="ngx-radiant__toolbar">
            <div class="ngx-radiant__toolbar-start">
              @if (showCounterControl() && canNavigate()) {
                <div class="ngx-radiant__counter" aria-live="polite">
                  {{ currentIndex() + 1 }} / {{ items().length }}
                </div>
              }
            </div>

            <div class="ngx-radiant__toolbar-actions">
              @if (canZoom() && showAnyZoomAction()) {
                <div class="ngx-radiant__zoom-controls" aria-label="Image zoom controls">
                  @if (toolbarActionEnabled('zoomOut')) {
                    <button type="button" class="ngx-radiant__button" aria-label="Zoom out" (click)="zoomOut()">
                      <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="10.5" cy="10.5" r="5.75"></circle>
                        <path d="M7.75 10.5h5.5"></path>
                        <path d="m15 15 4.25 4.25"></path>
                      </svg>
                    </button>
                  }
                  @if (toolbarActionEnabled('resetZoom')) {
                    <button type="button" class="ngx-radiant__zoom-value" aria-label="Reset zoom" (click)="resetZoom()">
                      {{ zoomPercent() }}%
                    </button>
                  }
                  @if (toolbarActionEnabled('zoomIn')) {
                    <button type="button" class="ngx-radiant__button" aria-label="Zoom in" (click)="zoomIn()">
                      <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="10.5" cy="10.5" r="5.75"></circle>
                        <path d="M7.75 10.5h5.5"></path>
                        <path d="M10.5 7.75v5.5"></path>
                        <path d="m15 15 4.25 4.25"></path>
                      </svg>
                    </button>
                  }
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

              @if (canToggleFullscreen()) {
                <button type="button" class="ngx-radiant__button" [attr.aria-label]="isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'" (click)="toggleFullscreen()">
                  @if (isFullscreen()) {
                    <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M9 3v6H3"></path>
                      <path d="M15 3v6h6"></path>
                      <path d="M9 21v-6H3"></path>
                      <path d="M15 21v-6h6"></path>
                    </svg>
                  } @else {
                    <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8.5 3H3v5.5"></path>
                      <path d="M15.5 3H21v5.5"></path>
                      <path d="M8.5 21H3v-5.5"></path>
                      <path d="M15.5 21H21v-5.5"></path>
                    </svg>
                  }
                </button>
              }

              @if (canDownload()) {
                <button type="button" class="ngx-radiant__button" aria-label="Download current item" (click)="downloadCurrent()">
                  <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 3v11"></path>
                    <path d="m7.5 10 4.5 4.5 4.5-4.5"></path>
                    <path d="M5 18.5h14"></path>
                  </svg>
                </button>
              }

              @if (canOpenOriginal()) {
                <button type="button" class="ngx-radiant__button" aria-label="Open original in new tab" (click)="openOriginal()">
                  <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 7H6.5A2.5 2.5 0 0 0 4 9.5v8A2.5 2.5 0 0 0 6.5 20h8A2.5 2.5 0 0 0 17 17.5V15"></path>
                    <path d="M13 4h7v7"></path>
                    <path d="M11 13 20 4"></path>
                  </svg>
                </button>
              }

              @if (toolbarActionEnabled('close')) {
                <button type="button" class="ngx-radiant__button" aria-label="Close" (click)="close()">
                  <svg class="ngx-radiant__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12"></path>
                    <path d="M18 6 6 18"></path>
                  </svg>
                </button>
              }
            </div>
          </header>

          @if (showNavigationControl() && canNavigate()) {
            <button
              type="button"
              class="ngx-radiant__nav ngx-radiant__nav--prev"
              aria-label="Previous item"
              (click)="previous()"
            >
              <svg class="ngx-radiant__icon ngx-radiant__icon--nav" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m15 5-7 7 7 7"></path>
              </svg>
            </button>
          }

          <figure
            class="ngx-radiant__stage"
            (pointerdown)="startGesture($event)"
            (pointermove)="moveGesture($event)"
            (pointerup)="endGesture($event)"
            (pointercancel)="endGesture($event)"
            (lostpointercapture)="endGesture($event)"
          >
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
                  #zoomMedia
                  class="ngx-radiant__media"
                  [style.transform]="zoomTransform()"
                  [class.ngx-radiant__media--zoomed]="zoomLevel() > 1"
                  [class.ngx-radiant__media--dragging]="dragging()"
                  [src]="currentItem().src"
                  [alt]="currentItem().alt ?? currentItem().caption ?? ''"
                  [attr.loading]="mainImageLoading()"
                  decoding="async"
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
              <svg class="ngx-radiant__icon ngx-radiant__icon--nav" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m9 5 7 7-7 7"></path>
              </svg>
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
                  <img [src]="item.thumb ?? item.src" [alt]="item.alt ?? ''" [attr.loading]="thumbnailLoading()" decoding="async" />
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
      display: inline-grid;
      place-items: center;
      width: 2.6rem;
      height: 2.6rem;
      font-size: 1.35rem;
      line-height: 1;
      padding: 0;
    }

    .ngx-radiant__icon {
      width: 1.2rem;
      height: 1.2rem;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .ngx-radiant__icon--nav {
      width: 1.75rem;
      height: 1.75rem;
      stroke-width: 2.25;
    }

    .ngx-radiant__zoom-value {
      min-width: 4.4rem;
    }

    .ngx-radiant__nav {
      display: inline-grid;
      place-items: center;
      align-self: center;
      width: 3rem;
      height: 3rem;
      border: 0;
      font-size: 2.6rem;
      line-height: 1;
      padding: 0;
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
      touch-action: pan-y;
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
  readonly swipeNavigation = input<boolean | undefined>(undefined);
  readonly swipeThreshold = input<number | undefined>(undefined);
  readonly pinchZoom = input<boolean | undefined>(undefined);
  readonly doubleTapZoom = input<boolean | undefined>(undefined);
  readonly lazyLoad = input<boolean | undefined>(undefined);
  readonly preloadImages = input<boolean | undefined>(undefined);
  readonly preloadRadius = input<number | undefined>(undefined);
  readonly toolbarActions = input<NgxRadiantToolbarAction[] | undefined>(undefined);
  readonly fullscreen = input<boolean | undefined>(undefined);
  readonly showFullscreenButton = input<boolean | undefined>(undefined);
  readonly showDownload = input<boolean | undefined>(undefined);
  readonly showOpenOriginal = input<boolean | undefined>(undefined);
  readonly trapFocus = input<boolean | undefined>(undefined);
  readonly restoreFocus = input<boolean | undefined>(undefined);
  readonly iframeAspectRatio = input<string | undefined>(undefined);
  readonly iframeAutoplay = input<boolean | undefined>(undefined);
  readonly iframeMuted = input<boolean | undefined>(undefined);
  readonly iframeAllowedOrigins = input<string[] | undefined>(undefined);

  readonly open = input(false);
  readonly index = input(0);

  readonly openChange = output<boolean>();
  readonly indexChange = output<number>();
  readonly closed = output<void>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zoomMedia = viewChild<ElementRef<HTMLElement>>('zoomMedia');
  private readonly shell = viewChild<ElementRef<HTMLElement>>('shell');
  protected readonly zoomLevel = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly dragging = signal(false);
  protected readonly isFullscreen = signal(false);
  private dragStart: { pointerId: number; x: number; y: number; panX: number; panY: number } | null = null;
  private gestureStart: { pointerId: number; x: number; y: number; time: number } | null = null;
  private readonly activePointers = new Map<number, { x: number; y: number }>();
  private pinchStart: { distance: number; zoom: number } | null = null;
  private lastTap: { time: number; x: number; y: number } | null = null;
  private readonly preloadedImages = new Set<string>();
  private previousFocus: HTMLElement | null = null;
  private fullscreenChangeHandler: (() => void) | null = null;
  private wasOpen = false;

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
      swipeNavigation: this.swipeNavigation() ?? config.swipeNavigation ?? NGX_RADIANT_DEFAULT_CONFIG.swipeNavigation,
      swipeThreshold: this.swipeThreshold() ?? config.swipeThreshold ?? NGX_RADIANT_DEFAULT_CONFIG.swipeThreshold,
      pinchZoom: this.pinchZoom() ?? config.pinchZoom ?? NGX_RADIANT_DEFAULT_CONFIG.pinchZoom,
      doubleTapZoom: this.doubleTapZoom() ?? config.doubleTapZoom ?? NGX_RADIANT_DEFAULT_CONFIG.doubleTapZoom,
      lazyLoad: this.lazyLoad() ?? config.lazyLoad ?? NGX_RADIANT_DEFAULT_CONFIG.lazyLoad,
      preloadImages: this.preloadImages() ?? config.preloadImages ?? NGX_RADIANT_DEFAULT_CONFIG.preloadImages,
      preloadRadius: this.preloadRadius() ?? config.preloadRadius ?? NGX_RADIANT_DEFAULT_CONFIG.preloadRadius,
      toolbarActions: this.toolbarActions() ?? config.toolbarActions ?? NGX_RADIANT_DEFAULT_CONFIG.toolbarActions,
      fullscreen: this.fullscreen() ?? config.fullscreen ?? NGX_RADIANT_DEFAULT_CONFIG.fullscreen,
      showFullscreenButton:
        this.showFullscreenButton() ?? config.showFullscreenButton ?? NGX_RADIANT_DEFAULT_CONFIG.showFullscreenButton,
      showDownload: this.showDownload() ?? config.showDownload ?? NGX_RADIANT_DEFAULT_CONFIG.showDownload,
      showOpenOriginal: this.showOpenOriginal() ?? config.showOpenOriginal ?? NGX_RADIANT_DEFAULT_CONFIG.showOpenOriginal,
      trapFocus: this.trapFocus() ?? config.trapFocus ?? NGX_RADIANT_DEFAULT_CONFIG.trapFocus,
      restoreFocus: this.restoreFocus() ?? config.restoreFocus ?? NGX_RADIANT_DEFAULT_CONFIG.restoreFocus,
      iframeAspectRatio: this.iframeAspectRatio() ?? config.iframeAspectRatio ?? NGX_RADIANT_DEFAULT_CONFIG.iframeAspectRatio,
      iframeAutoplay: this.iframeAutoplay() ?? config.iframeAutoplay ?? NGX_RADIANT_DEFAULT_CONFIG.iframeAutoplay,
      iframeMuted: this.iframeMuted() ?? config.iframeMuted ?? NGX_RADIANT_DEFAULT_CONFIG.iframeMuted,
      iframeAllowedOrigins:
        this.iframeAllowedOrigins() ?? config.iframeAllowedOrigins ?? NGX_RADIANT_DEFAULT_CONFIG.iframeAllowedOrigins,
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
  protected readonly showAnyZoomAction = computed(() =>
    this.toolbarActionEnabled('zoomOut') || this.toolbarActionEnabled('resetZoom') || this.toolbarActionEnabled('zoomIn'),
  );
  protected readonly canToggleFullscreen = computed(() =>
    this.toolbarActionEnabled('fullscreen') &&
    this.resolvedConfig().fullscreen &&
    this.resolvedConfig().showFullscreenButton &&
    this.fullscreenSupported(),
  );
  protected readonly canDownload = computed(() =>
    this.toolbarActionEnabled('download') && this.resolvedConfig().showDownload && this.safeActionUrl(this.currentItem().src) !== null,
  );
  protected readonly canOpenOriginal = computed(() =>
    this.toolbarActionEnabled('openOriginal') && this.resolvedConfig().showOpenOriginal && this.safeActionUrl(this.currentItem().src) !== null,
  );
  protected readonly mainImageLoading = computed(() => (this.resolvedConfig().lazyLoad ? 'eager' : null));
  protected readonly thumbnailLoading = computed(() => (this.resolvedConfig().lazyLoad ? 'lazy' : 'eager'));

  constructor() {
    this.destroyRef.onDestroy(() => this.detachFullscreenListener());

    effect(() => {
      const isOpen = this.open();
      this.resolvedConfig();

      if (isOpen && !this.wasOpen) {
        this.syncDialogFocus();
        this.attachFullscreenListener();
      }

      if (!isOpen && this.wasOpen) {
        this.exitFullscreen();
        this.resetPan();
        this.restorePreviousFocus();
      }

      this.wasOpen = isOpen;
    });

    effect(() => {
      this.open();
      this.currentIndex();
      this.currentItem().src;
      const config = this.resolvedConfig();
      this.zoomLevel.set(this.clampZoom(config.initialZoom));
      this.resetPan();
      this.preloadNearbyImages();
      this.attachFullscreenListener();
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

    this.exitFullscreen();
    this.resetPan();
    this.restorePreviousFocus();
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

  toggleFullscreen(): void {
    if (!this.isBrowser || !this.canToggleFullscreen()) {
      return;
    }

    if (this.isFullscreen()) {
      this.exitFullscreen();
      return;
    }

    const target = this.shell()?.nativeElement;
    target?.requestFullscreen?.().catch(() => undefined);
  }

  downloadCurrent(): void {
    if (!this.canDownload()) {
      return;
    }

    const actionUrl = this.safeActionUrl(this.currentItem().src);
    if (!actionUrl) {
      return;
    }

    const anchor = this.document.createElement('a');
    anchor.href = actionUrl;
    anchor.download = this.currentItem().downloadName ?? this.filenameFromSource(actionUrl);
    anchor.rel = 'noopener noreferrer';
    this.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  openOriginal(): void {
    if (!this.canOpenOriginal()) {
      return;
    }

    const actionUrl = this.safeActionUrl(this.currentItem().src);
    if (!actionUrl) {
      return;
    }

    this.document.defaultView?.open(actionUrl, '_blank', 'noopener,noreferrer');
  }

  startPan(event: PointerEvent): void {
    if (!this.canPan()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.capturePointer(event.currentTarget as HTMLElement, event.pointerId);
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
    event.stopPropagation();
    const bounds = this.getPanBounds(event.currentTarget as HTMLElement);
    this.panX.set(this.clamp(this.dragStart.panX + event.clientX - this.dragStart.x, -bounds.x, bounds.x));
    this.panY.set(this.clamp(this.dragStart.panY + event.clientY - this.dragStart.y, -bounds.y, bounds.y));
  }

  endPan(event: PointerEvent): void {
    if (this.dragStart?.pointerId === event.pointerId) {
      this.releasePointer(event.currentTarget as HTMLElement, event.pointerId);
      this.dragStart = null;
      this.dragging.set(false);
    }
  }

  startGesture(event: PointerEvent): void {
    if (!this.isImageGestureEnabled()) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    this.capturePointer(target, event.pointerId);
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 1) {
      this.gestureStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: Date.now() };
      this.pinchStart = null;
      return;
    }

    if (this.resolvedConfig().pinchZoom && this.activePointers.size === 2) {
      this.pinchStart = { distance: this.currentPointerDistance(), zoom: this.zoomLevel() };
      this.gestureStart = null;
      event.preventDefault();
    }
  }

  moveGesture(event: PointerEvent): void {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (!this.pinchStart || !this.resolvedConfig().pinchZoom || this.activePointers.size < 2) {
      return;
    }

    const distance = this.currentPointerDistance();
    if (this.pinchStart.distance <= 0 || distance <= 0) {
      return;
    }

    event.preventDefault();
    this.setZoom(this.pinchStart.zoom * (distance / this.pinchStart.distance));
  }

  endGesture(event: PointerEvent): void {
    if (!this.activePointers.has(event.pointerId)) {
      return;
    }

    const start = this.gestureStart;
    this.releasePointer(event.currentTarget as HTMLElement, event.pointerId);
    this.activePointers.delete(event.pointerId);

    if (this.activePointers.size < 2) {
      this.pinchStart = null;
    }

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const elapsed = Date.now() - start.time;
    this.gestureStart = null;

    if (this.handleSwipe(dx, dy)) {
      event.preventDefault();
      return;
    }

    if (event.pointerType !== 'mouse' && elapsed < 320 && Math.hypot(dx, dy) < 12) {
      this.handleDoubleTap(event);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.resolvedConfig().trapFocus) {
      this.trapTabFocus(event);
      return;
    }

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

  private handleSwipe(dx: number, dy: number): boolean {
    const threshold = Math.max(this.resolvedConfig().swipeThreshold, 1);
    if (!this.resolvedConfig().swipeNavigation || !this.canNavigate() || this.zoomLevel() > this.resolvedMinZoom()) {
      return false;
    }

    if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.25) {
      return false;
    }

    if (dx < 0) {
      this.next();
    } else {
      this.previous();
    }
    return true;
  }

  private handleDoubleTap(event: PointerEvent): void {
    if (!this.resolvedConfig().doubleTapZoom || !this.canZoom()) {
      return;
    }

    const now = Date.now();
    const previousTap = this.lastTap;
    this.lastTap = { time: now, x: event.clientX, y: event.clientY };
    if (!previousTap || now - previousTap.time > 300) {
      return;
    }

    if (Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) > 32) {
      return;
    }

    event.preventDefault();
    this.toggleZoom();
    this.lastTap = null;
  }

  protected toolbarActionEnabled(action: NgxRadiantToolbarAction): boolean {
    return this.resolvedConfig().toolbarActions.includes(action);
  }

  private fullscreenSupported(): boolean {
    return this.isBrowser && typeof this.document.documentElement.requestFullscreen === 'function';
  }

  private attachFullscreenListener(): void {
    if (!this.isBrowser || this.fullscreenChangeHandler || typeof this.document.addEventListener !== 'function') {
      return;
    }

    this.fullscreenChangeHandler = () => {
      this.isFullscreen.set(this.document.fullscreenElement === this.shell()?.nativeElement);
    };
    this.document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  private detachFullscreenListener(): void {
    if (!this.fullscreenChangeHandler || typeof this.document.removeEventListener !== 'function') {
      return;
    }

    this.document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    this.fullscreenChangeHandler = null;
  }

  private exitFullscreen(): void {
    if (!this.isBrowser) {
      this.isFullscreen.set(false);
      return;
    }

    if (this.document.fullscreenElement === this.shell()?.nativeElement) {
      this.document.exitFullscreen?.().catch(() => undefined);
    }
    this.isFullscreen.set(false);
  }

  private syncDialogFocus(): void {
    if (!this.isBrowser || !this.open()) {
      return;
    }

    if (
      !this.previousFocus &&
      typeof HTMLElement !== 'undefined' &&
      this.document.activeElement instanceof HTMLElement
    ) {
      this.previousFocus = this.document.activeElement;
    }

    queueMicrotask(() => {
      this.shell()?.nativeElement.focus();
    });
  }

  private restorePreviousFocus(): void {
    if (!this.isBrowser || !this.resolvedConfig().restoreFocus) {
      this.previousFocus = null;
      return;
    }

    const focusTarget = this.previousFocus;
    this.previousFocus = null;
    queueMicrotask(() => focusTarget?.focus?.());
  }

  private trapTabFocus(event: KeyboardEvent): void {
    const shell = this.shell()?.nativeElement;
    if (!shell) {
      return;
    }

    const focusable = Array.from(
      shell.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null || element === this.document.activeElement);

    if (focusable.length === 0) {
      event.preventDefault();
      shell.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;
    if (active === shell || !shell.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private safeActionUrl(source: string): string | null {
    if (!source) {
      return null;
    }

    try {
      const url = new URL(source, this.getBaseHref());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }

      return this.isRelativeUrl(source) ? `${url.pathname}${url.search}${url.hash}` : url.toString();
    } catch {
      return null;
    }
  }

  private filenameFromSource(source: string): string {
    try {
      const url = new URL(source, this.getBaseHref());
      const filename = url.pathname.split('/').filter(Boolean).at(-1);
      return filename || 'ngx-radiant-download';
    } catch {
      return 'ngx-radiant-download';
    }
  }

  private currentPointerDistance(): number {
    const [first, second] = Array.from(this.activePointers.values());
    if (!first || !second) {
      return 0;
    }

    return Math.hypot(second.x - first.x, second.y - first.y);
  }

  private capturePointer(target: HTMLElement, pointerId: number): void {
    try {
      target.setPointerCapture?.(pointerId);
    } catch {
      // Synthetic PointerEvents can miss the browser's active-pointer bookkeeping.
      // Gesture state still works without capture; real touches use capture when available.
    }
  }

  private releasePointer(target: HTMLElement, pointerId: number): void {
    try {
      target.releasePointerCapture?.(pointerId);
    } catch {
      // Capture may not exist for synthetic events or already-cancelled touch streams.
    }
  }

  private isImageGestureEnabled(): boolean {
    return this.open() && (this.currentItem().type ?? 'image') === 'image';
  }

  private preloadNearbyImages(): void {
    if (!this.isBrowser || !this.open() || !this.resolvedConfig().preloadImages || typeof Image === 'undefined') {
      return;
    }

    const items = this.items();
    if (items.length < 2) {
      return;
    }

    const radius = Math.max(Math.trunc(this.resolvedConfig().preloadRadius), 0);
    for (let offset = -radius; offset <= radius; offset += 1) {
      if (offset === 0) {
        continue;
      }

      const index = this.resolvedConfig().loop
        ? (this.currentIndex() + offset + items.length) % items.length
        : this.currentIndex() + offset;
      const item = items[index];
      if (!item || (item.type ?? 'image') !== 'image' || this.preloadedImages.has(item.src)) {
        continue;
      }

      const image = new Image();
      image.decoding = 'async';
      image.src = item.src;
      this.preloadedImages.add(item.src);
    }
  }

  private resolveFrameSrc(): string {
    const config = this.resolvedConfig();
    const source = this.currentItem().src;
    const baseHref = this.getBaseHref();

    try {
      const url = new URL(source, baseHref);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return 'about:blank';
      }

      if (config.iframeAllowedOrigins.length > 0 && !config.iframeAllowedOrigins.includes(url.origin)) {
        return 'about:blank';
      }

      if (config.iframeAutoplay) {
        url.searchParams.set('autoplay', '1');
      }
      if (config.iframeMuted) {
        url.searchParams.set('mute', '1');
        url.searchParams.set('muted', '1');
      }

      return this.isRelativeUrl(source) ? `${url.pathname}${url.search}${url.hash}` : url.toString();
    } catch {
      return 'about:blank';
    }
  }

  private getBaseHref(): string {
    return this.document.baseURI || (typeof globalThis.location !== 'undefined' ? globalThis.location.href : 'http://localhost/');
  }

  private isRelativeUrl(url: string): boolean {
    return !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//');
  }

  private clampCurrentPan(): void {
    if (!this.open()) {
      return;
    }

    const media = this.zoomMedia()?.nativeElement;
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
    this.gestureStart = null;
    this.pinchStart = null;
    this.lastTap = null;
    this.activePointers.clear();
    this.dragging.set(false);
  }
}
