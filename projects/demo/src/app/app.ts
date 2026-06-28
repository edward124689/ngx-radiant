import { Component } from '@angular/core';
import { NgxRadiantDirective, NgxRadiantItem } from 'ngx-radiant';

@Component({
  selector: 'app-root',
  imports: [NgxRadiantDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly singleImage = 'demo-art/aurora-landscape.png';

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
}
