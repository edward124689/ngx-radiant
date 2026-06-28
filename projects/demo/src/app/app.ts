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
      src: 'demo-art/aurora-landscape.png',
      thumb: 'demo-art/aurora-landscape.png',
      alt: 'Aurora lights reflected over an alpine mountain lake',
      caption: 'Aurora Lake — cinematic landscape preview with caption and thumbnails.',
    },
    {
      src: 'demo-art/canyon-prism.png',
      thumb: 'demo-art/canyon-prism.png',
      alt: 'Golden desert canyon with radiant light beams',
      caption: 'Radiant Canyon — gallery navigation, keyboard arrows, and looped browsing.',
    },
    {
      src: 'demo-art/bioluminescent-coast.png',
      thumb: 'demo-art/bioluminescent-coast.png',
      alt: 'Bioluminescent waves glowing on a moonlit coast',
      caption: 'Bioluminescent Coast — responsive overlay designed for Angular apps.',
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
