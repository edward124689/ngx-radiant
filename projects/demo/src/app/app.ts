import { Component } from '@angular/core';
import { NgxRadiantConfig, NgxRadiantDirective, NgxRadiantItem } from 'ngx-radiant';

@Component({
  selector: 'app-root',
  imports: [NgxRadiantDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly singleImage = 'demo-art/aurora-landscape.png';
  protected readonly compactConfig: NgxRadiantConfig = {
    zoomStep: 0.5,
    maxZoom: 8,
    showThumbnails: true,
    showZoomSlider: true,
    showFullscreenButton: true,
    showDownload: true,
    showOpenOriginal: true,
  };

  protected readonly iframeConfig: NgxRadiantConfig = {
    showCounter: false,
    showNavigation: false,
    zoomable: false,
    iframeAspectRatio: '16 / 9',
    iframeAutoplay: true,
    iframeAllowedOrigins: ['https://www.youtube.com'],
  };

  protected readonly errorStateConfig: NgxRadiantConfig = {
    showCounter: false,
    showNavigation: false,
    showThumbnails: false,
    showImageLoader: true,
    imageErrorText: 'Demo fallback: this image could not be loaded.',
  };

  protected readonly closeBehaviorConfig: NgxRadiantConfig = {
    closeOnBackdrop: false,
    showCloseButton: true,
    showCounter: false,
    showNavigation: false,
    showThumbnails: false,
  };

  protected readonly iframeItems: NgxRadiantItem[] = [
    {
      src: 'https://www.youtube.com/embed/jYqX4YUzcKs',
      type: 'iframe',
      caption: 'Iframe support — YouTube embeds render inside the same Radiant overlay.',
      thumb: 'demo-art/canyon-prism.png',
    },
  ];

  protected readonly closeBehaviorItems: NgxRadiantItem[] = [
    {
      src: 'demo-art/bioluminescent-coast.png',
      alt: 'Bioluminescent coast static backdrop demo',
      caption: 'Close behavior — backdrop clicks are disabled, while Escape and the close button still work.',
    },
  ];

  protected readonly brokenImageItems: NgxRadiantItem[] = [
    {
      src: 'demo-art/missing-radiant-image.png',
      alt: 'Missing image fallback demo',
      caption: 'Error fallback — Ngx Radiant can show a friendly message when an image fails to load.',
    },
  ];

  protected readonly galleryItems: NgxRadiantItem[] = [
    {
      src: 'demo-art/aurora-landscape.png',
      thumb: 'demo-art/aurora-landscape.png',
      alt: 'Aurora lights reflected over an alpine mountain lake',
      caption: 'Aurora Lake — cinematic landscape preview with caption and thumbnails.',
      downloadName: 'aurora-lake.png',
    },
    {
      src: 'demo-art/canyon-prism.png',
      thumb: 'demo-art/canyon-prism.png',
      alt: 'Golden desert canyon with radiant light beams',
      caption: 'Radiant Canyon — gallery navigation, keyboard arrows, and looped browsing.',
      downloadName: 'radiant-canyon.png',
    },
    {
      src: 'demo-art/bioluminescent-coast.png',
      thumb: 'demo-art/bioluminescent-coast.png',
      alt: 'Bioluminescent waves glowing on a moonlit coast',
      caption: 'Bioluminescent Coast — responsive overlay designed for Angular apps.',
      downloadName: 'bioluminescent-coast.png',
    },
  ];
}
