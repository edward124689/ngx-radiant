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
    expect(compiled.querySelector('.directive-card--multi')?.textContent).toContain('Multi-image directive');
    expect(compiled.querySelector('.directive-card--single')?.textContent).toContain('Single-image directive');
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
    expect(document.querySelector('.ngx-radiant__counter')?.textContent).toContain('1 / 1');
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
    expect(document.querySelector('.ngx-radiant__counter')?.textContent).toContain('1 / 1');
    expect(document.querySelector('.ngx-radiant__caption')?.textContent).toContain('Single-image direct image click');
  });
});
