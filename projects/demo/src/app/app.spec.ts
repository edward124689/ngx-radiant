import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
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
  });

  it('opens the lightbox from the hero button', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.primary-action')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('.ngx-radiant')).toBeTruthy();
    expect(compiled.querySelector('.ngx-radiant__counter')?.textContent).toContain('1 / 3');
  });
});
