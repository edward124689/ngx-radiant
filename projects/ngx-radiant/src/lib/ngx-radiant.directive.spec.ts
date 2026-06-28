import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxRadiantItem } from './ngx-radiant';
import { NgxRadiantDirective } from './ngx-radiant.directive';

@Component({
  imports: [NgxRadiantDirective],
  template: `
    <button type="button" [ngxRadiant]="items" [radiantIndex]="1">Open gallery</button>
  `,
})
class DirectiveHost {
  readonly items: NgxRadiantItem[] = [
    { src: '/assets/photo-1.jpg', alt: 'First photo' },
    { src: '/assets/photo-2.jpg', alt: 'Second photo', caption: 'Second caption' },
  ];
}

describe('NgxRadiantDirective', () => {
  let fixture: ComponentFixture<DirectiveHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectiveHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('ngx-radiant-overlay').forEach((element) => element.remove());
  });

  it('opens a lightbox overlay from the host click', () => {
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    const overlay = document.querySelector('ngx-radiant-overlay');
    const image = overlay?.querySelector('.ngx-radiant__media') as HTMLImageElement | null;

    expect(overlay).toBeTruthy();
    expect(overlay?.querySelector('.ngx-radiant__counter')?.textContent).toContain('2 / 2');
    expect(image?.getAttribute('src')).toBe('/assets/photo-2.jpg');
  });


  it('cleans up the dynamic overlay across repeated open and close cycles', async () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    for (let cycle = 0; cycle < 2; cycle += 1) {
      button.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.querySelectorAll('ngx-radiant-overlay').length).toBe(1);
      expect(document.querySelector('.ngx-radiant')).toBeTruthy();

      document.querySelector<HTMLButtonElement>('ngx-radiant-overlay [aria-label="Close"]')?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.querySelectorAll('ngx-radiant-overlay').length).toBe(0);
    }
  });

  it('supports single image shorthand', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [SingleImageHost],
      })
      .compileComponents();

    const singleFixture = TestBed.createComponent(SingleImageHost);
    singleFixture.detectChanges();
    singleFixture.nativeElement.querySelector('button').click();
    singleFixture.detectChanges();

    const overlay = document.querySelector('ngx-radiant-overlay');
    const image = overlay?.querySelector('.ngx-radiant__media') as HTMLImageElement | null;

    expect(image?.getAttribute('src')).toBe('/assets/single.jpg');
    expect(image?.getAttribute('alt')).toBe('Single image');
    expect(overlay?.querySelector('.ngx-radiant__caption')?.textContent).toContain('Single caption');
  });

  it('passes radiantConfig to the created lightbox', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ConfigHost],
      })
      .compileComponents();

    const configFixture = TestBed.createComponent(ConfigHost);
    configFixture.detectChanges();
    configFixture.nativeElement.querySelector('button').click();
    configFixture.detectChanges();

    const overlay = document.querySelector('ngx-radiant-overlay');
    expect(overlay?.querySelector('.ngx-radiant__counter')).toBeNull();
    expect(overlay?.querySelector('.ngx-radiant__nav')).toBeNull();
    expect(overlay?.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });

});

@Component({
  imports: [NgxRadiantDirective],
  template: `
    <button
      type="button"
      ngxRadiant="/assets/single.jpg"
      radiantAlt="Single image"
      radiantCaption="Single caption"
    >
      Open single
    </button>
  `,
})
class SingleImageHost {}


@Component({
  imports: [NgxRadiantDirective],
  template: `
    <button
      type="button"
      [ngxRadiant]="items"
      [radiantConfig]="{ showCounter: false, showNavigation: false, zoomable: false }"
    >
      Open configured
    </button>
  `,
})
class ConfigHost {
  readonly items: NgxRadiantItem[] = [
    { src: '/assets/configured-1.jpg', alt: 'Configured first' },
    { src: '/assets/configured-2.jpg', alt: 'Configured second' },
  ];
}
