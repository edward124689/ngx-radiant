import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxRadiantLightbox } from './ngx-radiant';

describe('NgxRadiantLightbox', () => {
  let component: NgxRadiantLightbox;
  let fixture: ComponentFixture<NgxRadiantLightbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxRadiantLightbox],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxRadiantLightbox);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [
      { src: '/assets/photo-1.jpg', alt: 'First photo', caption: 'First caption' },
      { src: '/assets/photo-2.jpg', alt: 'Second photo' },
    ]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('creates the lightbox', () => {
    expect(component).toBeTruthy();
  });

  it('renders the selected item and caption', () => {
    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    const caption = fixture.nativeElement.querySelector('.ngx-radiant__caption') as HTMLElement;

    expect(image.getAttribute('src')).toBe('/assets/photo-1.jpg');
    expect(image.getAttribute('alt')).toBe('First photo');
    expect(caption.textContent?.trim()).toBe('First caption');
  });

  it('emits index changes for next and previous navigation', () => {
    const emittedIndexes: number[] = [];
    component.indexChange.subscribe((index) => emittedIndexes.push(index));

    component.next();
    fixture.componentRef.setInput('index', emittedIndexes.at(-1));
    fixture.detectChanges();

    let image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(emittedIndexes.at(-1)).toBe(1);
    expect(image.getAttribute('src')).toBe('/assets/photo-2.jpg');

    component.previous();
    fixture.componentRef.setInput('index', emittedIndexes.at(-1));
    fixture.detectChanges();

    image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(emittedIndexes.at(-1)).toBe(0);
    expect(image.getAttribute('src')).toBe('/assets/photo-1.jpg');
  });

  it('emits close changes on Escape when enabled', () => {
    const emittedOpenStates: boolean[] = [];
    component.openChange.subscribe((open) => emittedOpenStates.push(open));

    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(emittedOpenStates).toEqual([false]);
  });

  it('hides counter and navigation controls for a single item', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ngx-radiant__nav--prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ngx-radiant__nav--next')).toBeNull();
  });

  it('zooms image content in and out', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { zoomStep: 0.5, maxZoom: 2 });
    fixture.detectChanges();

    const zoomIn = fixture.nativeElement.querySelector('[aria-label="Zoom in"]') as HTMLButtonElement;
    zoomIn.click();
    fixture.detectChanges();

    let image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1.5)');

    const zoomOut = fixture.nativeElement.querySelector('[aria-label="Zoom out"]') as HTMLButtonElement;
    zoomOut.click();
    fixture.detectChanges();

    image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
  });


  it('supports an optional zoom slider', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { showZoomSlider: true, minZoom: 1, maxZoom: 8, zoomStep: 0.5 });
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector('.ngx-radiant__zoom-slider') as HTMLInputElement;
    slider.value = '4';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(slider.getAttribute('max')).toBe('8');
    expect(image.style.transform).toBe('translate(0px, 0px) scale(4)');
  });

  it('allows dragging a zoomed image', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { maxZoom: 8 });
    fixture.detectChanges();

    component.setZoom(3);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    Object.defineProperty(image, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(image, 'clientHeight', { configurable: true, value: 300 });
    Object.defineProperty(image.parentElement, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(image.parentElement, 'clientHeight', { configurable: true, value: 400 });
    image.setPointerCapture = () => undefined;
    image.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 20, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 40, clientY: 55, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 40, clientY: 55, bubbles: true }));
    fixture.detectChanges();

    expect(image.style.transform).toBe('translate(30px, 35px) scale(3)');
  });

  it('clamps dragging so zoomed images stay within the stage', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { maxZoom: 3 });
    fixture.detectChanges();

    component.setZoom(3);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    Object.defineProperty(image, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(image, 'clientHeight', { configurable: true, value: 300 });
    Object.defineProperty(image.parentElement, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(image.parentElement, 'clientHeight', { configurable: true, value: 400 });
    image.setPointerCapture = () => undefined;
    image.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 2000, clientY: 2000, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 2000, clientY: 2000, bubbles: true }));
    fixture.detectChanges();

    expect(image.style.transform).toBe('translate(300px, 250px) scale(3)');
  });


  it('navigates with horizontal swipe gestures when not zoomed', () => {
    const emittedIndexes: number[] = [];
    component.indexChange.subscribe((index) => emittedIndexes.push(index));
    fixture.detectChanges();

    const stage = fixture.nativeElement.querySelector('.ngx-radiant__stage') as HTMLElement;
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 11, pointerType: 'touch', clientX: 220, clientY: 100, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 11, pointerType: 'touch', clientX: 120, clientY: 108, bubbles: true }));
    fixture.detectChanges();

    expect(emittedIndexes.at(-1)).toBe(1);
  });

  it('supports pinch zoom gestures on image items', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { maxZoom: 4 });
    fixture.detectChanges();

    const stage = fixture.nativeElement.querySelector('.ngx-radiant__stage') as HTMLElement;
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 100, clientY: 0, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointermove', { pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 0, bubbles: true }));
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.style.transform).toBe('translate(0px, 0px) scale(2)');
  });

  it('toggles zoom on mobile double tap', () => {
    fixture.componentRef.setInput('items', [{ src: '/assets/single.jpg', alt: 'Single' }]);
    fixture.componentRef.setInput('config', { maxZoom: 4 });
    fixture.detectChanges();

    const stage = fixture.nativeElement.querySelector('.ngx-radiant__stage') as HTMLElement;
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 21, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 22, pointerType: 'touch', clientX: 154, clientY: 102, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 22, pointerType: 'touch', clientX: 154, clientY: 102, bubbles: true }));
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.style.transform).toBe('translate(0px, 0px) scale(4)');
  });


  it('clears pending double-tap state when the item changes', () => {
    fixture.componentRef.setInput('config', { maxZoom: 4 });
    fixture.detectChanges();

    let stage = fixture.nativeElement.querySelector('.ngx-radiant__stage') as HTMLElement;
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 31, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 31, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));

    fixture.componentRef.setInput('index', 1);
    fixture.detectChanges();

    stage = fixture.nativeElement.querySelector('.ngx-radiant__stage') as HTMLElement;
    stage.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 32, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { pointerId: 32, pointerType: 'touch', clientX: 150, clientY: 100, bubbles: true }));
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('lazy-loads thumbnails and preloads nearby image items', () => {
    const originalImage = globalThis.Image;
    const preloaded: string[] = [];
    class MockImage {
      decoding = 'auto';
      set src(value: string) {
        preloaded.push(value);
      }
    }
    Object.defineProperty(globalThis, 'Image', { configurable: true, value: MockImage });

    try {
      fixture.componentRef.setInput('items', [
        { src: '/assets/lazy-1.jpg', alt: 'First photo' },
        { src: '/assets/lazy-2.jpg', alt: 'Second photo' },
        { src: '/assets/lazy-3.jpg', alt: 'Third photo' },
      ]);
      fixture.componentRef.setInput('config', { loop: false, preloadRadius: 1 });
      fixture.componentRef.setInput('index', 0);
      fixture.detectChanges();

      const thumbs = Array.from(fixture.nativeElement.querySelectorAll('.ngx-radiant__thumb img')) as HTMLImageElement[];
      expect(thumbs.every((thumb) => thumb.getAttribute('loading') === 'lazy')).toBe(true);
      expect(preloaded).toContain('/assets/lazy-2.jpg');
      expect(preloaded).not.toContain('/assets/lazy-3.jpg');
    } finally {
      Object.defineProperty(globalThis, 'Image', { configurable: true, value: originalImage });
    }
  });


  it('renders configured toolbar actions without forcing a version bump', () => {
    fixture.componentRef.setInput('config', {
      zoomable: false,
      showDownload: true,
      showOpenOriginal: true,
      fullscreen: false,
      toolbarActions: ['download', 'openOriginal', 'close'],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[aria-label="Download current item"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Open original in new tab"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Zoom in"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Enter fullscreen"]')).toBeNull();
  });

  it('supports download and open-original toolbar actions', () => {
    fixture.componentRef.setInput('items', [
      { src: '/assets/export-photo.jpg', alt: 'Export photo', downloadName: 'custom-photo.jpg' },
    ]);
    fixture.componentRef.setInput('config', { showDownload: true, showOpenOriginal: true });
    fixture.detectChanges();

    const clickedDownloads: Array<{ href: string; download: string }> = [];
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function click() {
      clickedDownloads.push({ href: this.getAttribute('href') ?? '', download: this.getAttribute('download') ?? '' });
    };

    const originalOpen = window.open;
    let openedUrl = '';
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: (url?: string | URL) => {
        openedUrl = String(url ?? '');
        return null;
      },
    });

    try {
      component.downloadCurrent();
      component.openOriginal();
    } finally {
      HTMLAnchorElement.prototype.click = originalClick;
      Object.defineProperty(window, 'open', { configurable: true, value: originalOpen });
    }

    expect(clickedDownloads).toEqual([{ href: '/assets/export-photo.jpg', download: 'custom-photo.jpg' }]);
    expect(openedUrl).toBe('/assets/export-photo.jpg');
  });


  it('hides and ignores download/open-original actions for unsafe URL protocols', () => {
    fixture.componentRef.setInput('items', [{ src: 'javascript:alert(1)', type: 'iframe', alt: 'Unsafe' }]);
    fixture.componentRef.setInput('config', { showDownload: true, showOpenOriginal: true });
    fixture.detectChanges();

    const originalOpen = window.open;
    let opened = false;
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: () => {
        opened = true;
        return null;
      },
    });

    try {
      expect(fixture.nativeElement.querySelector('[aria-label="Download current item"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[aria-label="Open original in new tab"]')).toBeNull();
      component.downloadCurrent();
      component.openOriginal();
    } finally {
      Object.defineProperty(window, 'open', { configurable: true, value: originalOpen });
    }

    expect(opened).toBe(false);
  });

  it('calls the Fullscreen API when fullscreen is enabled', () => {
    let requested = 0;
    const originalDocumentFullscreen = document.documentElement.requestFullscreen;
    document.documentElement.requestFullscreen = () => Promise.resolve();

    try {
      fixture.componentRef.setInput('config', { fullscreen: true, showFullscreenButton: true });
      fixture.detectChanges();

      const shell = fixture.nativeElement.querySelector('.ngx-radiant__shell') as HTMLElement & {
        requestFullscreen?: () => Promise<void>;
      };
      shell.requestFullscreen = () => {
        requested += 1;
        return Promise.resolve();
      };

      const fullscreen = fixture.nativeElement.querySelector('[aria-label="Enter fullscreen"]') as HTMLButtonElement;
      fullscreen.click();
    } finally {
      document.documentElement.requestFullscreen = originalDocumentFullscreen;
    }

    expect(requested).toBe(1);
  });

  it('traps keyboard focus inside the toolbar from edge and shell focus states', () => {
    fixture.componentRef.setInput('config', { showDownload: true, showOpenOriginal: true });
    fixture.detectChanges();

    const shell = fixture.nativeElement.querySelector('.ngx-radiant__shell') as HTMLElement;
    const buttons = Array.from(shell.querySelectorAll('button')) as HTMLButtonElement[];
    for (const button of buttons) {
      Object.defineProperty(button, 'offsetParent', { configurable: true, value: shell });
    }

    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    shell.focus();
    shell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    shell.focus();
    shell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    last.focus();
    shell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
  });

  it('supports config-driven UI options', () => {
    fixture.componentRef.setInput('config', {
      showCounter: false,
      showNavigation: false,
      showThumbnails: false,
      zoomable: false,
      ariaLabel: 'Configured lightbox',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-radiant')?.getAttribute('aria-label')).toBe('Configured lightbox');
    expect(fixture.nativeElement.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ngx-radiant__nav')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ngx-radiant__thumbs')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });

  it('renders iframe items with configurable aspect ratio and autoplay params', () => {
    fixture.componentRef.setInput('items', [
      {
        src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
        type: 'iframe',
        caption: 'YouTube embed',
      },
    ]);
    fixture.componentRef.setInput('config', { iframeAspectRatio: '4 / 3', iframeAutoplay: true, iframeMuted: true });
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame).toBeTruthy();
    expect(frame.style.aspectRatio).toBe('4 / 3');
    expect(frame.getAttribute('src')).toContain('autoplay=1');
    expect(frame.getAttribute('src')).toContain('mute=1');
    expect(frame.getAttribute('allowfullscreen')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });


  it('does not mute iframe autoplay unless iframeMuted is configured', () => {
    fixture.componentRef.setInput('items', [
      {
        src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
        type: 'iframe',
      },
    ]);
    fixture.componentRef.setInput('config', { iframeAutoplay: true });
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toContain('autoplay=1');
    expect(frame.getAttribute('src')).not.toContain('mute=1');
    expect(frame.getAttribute('src')).not.toContain('muted=1');
  });


  it('rejects unsafe iframe protocols and origins before trusting the resource URL', () => {
    fixture.componentRef.setInput('items', [
      {
        src: 'javascript:alert(1)',
        type: 'iframe',
      },
    ]);
    fixture.detectChanges();

    let frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('about:blank');

    fixture.componentRef.setInput('items', [
      {
        src: 'https://evil.example/embed',
        type: 'iframe',
      },
    ]);
    fixture.componentRef.setInput('config', { iframeAllowedOrigins: ['https://www.youtube.com'] });
    fixture.detectChanges();

    frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('about:blank');
  });

  it('supports direct iframe inputs overriding config values', () => {
    fixture.componentRef.setInput('items', [
      {
        src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
        type: 'iframe',
      },
    ]);
    fixture.componentRef.setInput('config', {
      iframeAspectRatio: '1 / 1',
      iframeAutoplay: false,
      iframeMuted: false,
      iframeAllowedOrigins: ['https://example.com'],
    });
    fixture.componentRef.setInput('iframeAspectRatio', '21 / 9');
    fixture.componentRef.setInput('iframeAutoplay', true);
    fixture.componentRef.setInput('iframeMuted', true);
    fixture.componentRef.setInput('iframeAllowedOrigins', ['https://www.youtube.com']);
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame.style.aspectRatio).toBe('21 / 9');
    expect(frame.getAttribute('src')).toContain('autoplay=1');
    expect(frame.getAttribute('src')).toContain('mute=1');
    expect(frame.getAttribute('src')).not.toBe('about:blank');
  });

});
