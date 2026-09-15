import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ScrollService } from '../../../core/services/ScrollService/scroll.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  constructor(private scrollService: ScrollService) { }

  scrollToContact() {
    this.scrollService.scrollToSection('contact');
  }

  scrollDown() {
    this.scrollService.scrollToSection('about');
  }
}
