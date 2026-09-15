import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../../../core/services/storage/storage.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  storage=inject(StorageService)
  userName: string = 'Usuario';
  currentYear: number = new Date().getFullYear();
  circles: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    const user = this.storage.getUser();
    this.userName = user || 'Usuario';

    this.generateCircles();
    setTimeout(() => {
      this.navigateToDashboard();
    }, 8000);
  }

  generateCircles() {
    for (let i = 0; i < 12; i++) {
      this.circles.push({
        size: Math.random() * 200 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5
      });
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
