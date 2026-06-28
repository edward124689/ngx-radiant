import { ChangeDetectorRef, Component, OnDestroy, afterNextRender, signal } from '@angular/core';
import { NgxRadiantItem, NgxRadiantLightbox } from 'ngx-radiant';

@Component({
  selector: 'app-root',
  imports: [NgxRadiantLightbox],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(0);

  protected readonly galleryItems: NgxRadiantItem[] = [
    {
      src: 'demo-art/aurora.svg',
      thumb: 'demo-art/aurora.svg',
      alt: 'Abstract aurora gradient over a dark horizon',
      caption: 'Aurora mode — cinematic image preview with caption and thumbnails.',
    },
    {
      src: 'demo-art/prism.svg',
      thumb: 'demo-art/prism.svg',
      alt: 'Radiant prism glass shapes on a midnight background',
      caption: 'Prism mode — gallery navigation, keyboard arrows, and looped browsing.',
    },
    {
      src: 'demo-art/orbit.svg',
      thumb: 'demo-art/orbit.svg',
      alt: 'Glowing orbital rings around a soft core',
      caption: 'Orbit mode — responsive overlay designed for Angular apps.',
    },
  ];

  private removeDocumentClickListener = () => undefined;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
    this.removeDocumentClickListener = () => undefined;

    afterNextRender(() => {
      const handleClick = (event: MouseEvent) => {
        const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-demo-open-index]');
        if (!trigger) {
          return;
        }

        const index = Number(trigger.dataset['demoOpenIndex'] ?? 0);
        this.openGallery(Number.isFinite(index) ? index : 0);
      };

      document.addEventListener('click', handleClick);
      this.removeDocumentClickListener = () => {
        document.removeEventListener('click', handleClick);
      };
    });
  }

  ngOnDestroy(): void {
    this.removeDocumentClickListener();
  }

  protected openGallery(index: number): void {
    this.activeIndex.set(index);
    this.isOpen.set(true);
    this.changeDetectorRef.detectChanges();
  }
}
