import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('ngx-radiant-overlay').forEach((element) => element.remove());
  });

  it('creates the demo app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the Ngx Radiant hero', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Ngx Radiant');
    expect(compiled.querySelectorAll('.gallery-tile').length).toBe(3);
    expect(compiled.querySelectorAll('.feature-grid code').length).toBe(3);
    expect(compiled.querySelector('.directive-card--multi')?.textContent).toContain('Multi-image directive');
    expect(compiled.querySelector('.collage-trigger')?.textContent).toContain('3 image gallery');
    expect(compiled.querySelector('.directive-card--single')?.textContent).toContain('Single-image directive');
    expect(compiled.querySelector('.media-demo')?.textContent).toContain('Iframe / YouTube');
    expect(compiled.querySelector('.media-demo')?.textContent).toContain('Loading / error');
  });


  it('opens the multi-image lightbox from the preview collage', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.collage-trigger')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.ngx-radiant')).toBeTruthy();
    expect(document.querySelector('.ngx-radiant__counter')?.textContent).toContain('1 / 3');
  });

  it('opens the lightbox from the hero button', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.primary-action')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.ngx-radiant')).toBeTruthy();
    expect(document.querySelector('.ngx-radiant__counter')?.textContent).toContain('1 / 3');
  });

  it('opens the directive single-image demo button', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.directive-card--single .demo-trigger')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.ngx-radiant')).toBeTruthy();
    expect(document.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(document.querySelector('.ngx-radiant__nav--prev')).toBeNull();
    expect(document.querySelector('.ngx-radiant__caption')?.textContent).toContain('Single-image directive preview');
  });

  it('opens the single-image lightbox by clicking the preview image', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.single-preview-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.ngx-radiant')).toBeTruthy();
    expect(document.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(document.querySelector('.ngx-radiant__nav--prev')).toBeNull();
    expect(document.querySelector('.ngx-radiant__caption')?.textContent).toContain('Single-image direct image click');
  });

  it('opens the image error fallback demo with friendly fallback copy', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.media-demo-card--fallback')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const image = document.querySelector('.ngx-radiant__media') as HTMLImageElement | null;
    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(document.querySelector('.ngx-radiant__image-state--error')?.textContent).toContain('Demo fallback');
    expect(document.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(document.querySelector('.ngx-radiant__nav--prev')).toBeNull();
  });

  it('opens the iframe media demo without single-item counter or nav', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.media-demo-card--iframe')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelector('.ngx-radiant__frame')).toBeTruthy();
    const frame = document.querySelector('.ngx-radiant__frame') as HTMLIFrameElement | null;
    expect(frame?.getAttribute('src')).toContain('https://www.youtube.com/embed/jYqX4YUzcKs');
    expect(frame?.getAttribute('src')).toContain('autoplay=1');
    expect(frame?.getAttribute('src')).not.toContain('mute=1');
    expect(frame?.style.aspectRatio).toBe('16 / 9');
    expect(document.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(document.querySelector('.ngx-radiant__nav--prev')).toBeNull();
  });

});
