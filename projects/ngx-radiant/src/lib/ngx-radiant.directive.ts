import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  HostListener,
  PLATFORM_ID,
  createComponent,
  inject,
  input,
} from '@angular/core';

import { NgxRadiantItem, NgxRadiantItemType, NgxRadiantLightbox } from './ngx-radiant';

interface NgxRadiantSubscription {
  unsubscribe(): void;
}

@Directive({
  selector: '[ngxRadiant]',
  exportAs: 'ngxRadiant',
})
export class NgxRadiantDirective {
  readonly ngxRadiant = input<NgxRadiantItem | NgxRadiantItem[] | string | null>(null);
  readonly radiantItems = input<NgxRadiantItem[] | null>(null);
  readonly radiantIndex = input(0);
  readonly radiantType = input<NgxRadiantItemType | undefined>(undefined);
  readonly radiantAlt = input<string | undefined>(undefined);
  readonly radiantCaption = input<string | undefined>(undefined);
  readonly radiantThumb = input<string | undefined>(undefined);
  readonly radiantAriaLabel = input('Image gallery lightbox');
  readonly radiantCloseOnEscape = input(true);
  readonly radiantLoop = input(true);
  readonly radiantShowThumbnails = input(true);

  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private lightboxRef: ComponentRef<NgxRadiantLightbox> | null = null;
  private hostElement: HTMLElement | null = null;
  private subscriptions: NgxRadiantSubscription[] = [];
  private activeIndex = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyLightbox());
  }

  @HostListener('click', ['$event'])
  open(event?: Event): void {
    event?.preventDefault();

    const items = this.resolveItems();
    if (!items.length || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.activeIndex = this.normalizeIndex(this.radiantIndex(), items.length);
    const lightboxRef = this.ensureLightbox();
    this.syncLightboxInputs(lightboxRef, items, true);
  }

  close(): void {
    this.destroyLightbox();
  }

  private ensureLightbox(): ComponentRef<NgxRadiantLightbox> {
    if (this.lightboxRef) {
      return this.lightboxRef;
    }

    this.hostElement = this.document.createElement('ngx-radiant-overlay');
    this.document.body.appendChild(this.hostElement);

    this.lightboxRef = createComponent(NgxRadiantLightbox, {
      environmentInjector: this.environmentInjector,
      hostElement: this.hostElement,
    });

    this.appRef.attachView(this.lightboxRef.hostView);
    this.subscriptions = [
      this.lightboxRef.instance.indexChange.subscribe((index) => {
        this.activeIndex = index;
        this.lightboxRef?.setInput('index', index);
        this.lightboxRef?.changeDetectorRef.detectChanges();
      }),
      this.lightboxRef.instance.openChange.subscribe((open) => {
        if (!open) {
          this.destroyLightbox();
        }
      }),
      this.lightboxRef.instance.closed.subscribe(() => this.destroyLightbox()),
    ];

    return this.lightboxRef;
  }

  private syncLightboxInputs(
    lightboxRef: ComponentRef<NgxRadiantLightbox>,
    items: NgxRadiantItem[],
    open: boolean,
  ): void {
    lightboxRef.setInput('items', items);
    lightboxRef.setInput('index', this.activeIndex);
    lightboxRef.setInput('open', open);
    lightboxRef.setInput('ariaLabel', this.radiantAriaLabel());
    lightboxRef.setInput('closeOnEscape', this.radiantCloseOnEscape());
    lightboxRef.setInput('loop', this.radiantLoop());
    lightboxRef.setInput('showThumbnails', this.radiantShowThumbnails());
    lightboxRef.changeDetectorRef.detectChanges();
  }

  private destroyLightbox(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];

    if (this.lightboxRef) {
      this.appRef.detachView(this.lightboxRef.hostView);
      this.lightboxRef.destroy();
      this.lightboxRef = null;
    }

    this.hostElement?.remove();
    this.hostElement = null;
  }

  private resolveItems(): NgxRadiantItem[] {
    const explicitItems = this.radiantItems();
    if (explicitItems?.length) {
      return explicitItems;
    }

    const value = this.ngxRadiant();
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return [
        {
          src: value,
          type: this.radiantType(),
          alt: this.radiantAlt(),
          caption: this.radiantCaption(),
          thumb: this.radiantThumb(),
        },
      ];
    }

    return [value];
  }

  private normalizeIndex(index: number, itemCount: number): number {
    return Math.min(Math.max(Math.trunc(index) || 0, 0), itemCount - 1);
  }
}
