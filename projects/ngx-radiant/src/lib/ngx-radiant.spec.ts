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
});
