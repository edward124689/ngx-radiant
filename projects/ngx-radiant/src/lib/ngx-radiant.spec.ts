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

  it('supports next and previous navigation', () => {
    component.next();
    fixture.detectChanges();

    let image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('/assets/photo-2.jpg');

    component.previous();
    fixture.detectChanges();

    image = fixture.nativeElement.querySelector('.ngx-radiant__media') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('/assets/photo-1.jpg');
  });

  it('closes on Escape when enabled', () => {
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ngx-radiant')).toBeNull();
  });
});
