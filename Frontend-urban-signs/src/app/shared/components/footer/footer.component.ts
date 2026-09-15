import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks: any[] = [
    { platform: 'facebook', url: '#', label: 'Facebook' },
    { platform: 'instagram', url: '#', label: 'Instagram' },
    { platform: 'linkedin', url: '#', label: 'LinkedIn' }
  ];
}
