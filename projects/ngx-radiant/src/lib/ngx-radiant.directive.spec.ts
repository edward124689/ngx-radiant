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
