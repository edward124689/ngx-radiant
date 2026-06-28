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
    image.setPointerCapture = () => undefined;
    image.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 20, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 40, clientY: 55, bubbles: true }));
    image.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 40, clientY: 55, bubbles: true }));
    fixture.detectChanges();

    expect(image.style.transform).toBe('translate(30px, 35px) scale(3)');
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

  it('renders iframe items with an embed frame', () => {
    fixture.componentRef.setInput('items', [
      {
        src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
        type: 'iframe',
        caption: 'YouTube embed',
      },
    ]);
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();

    const frame = fixture.nativeElement.querySelector('.ngx-radiant__frame') as HTMLIFrameElement;
    expect(frame).toBeTruthy();
    expect(frame.getAttribute('allowfullscreen')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });

});
