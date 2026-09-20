import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../core/directives/reveal-on-scroll.directive';
import { CountUpDirective } from '../../core/directives/count-up.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective, CountUpDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  values = [
    { icon: '🤝', title: 'Transparency', text: 'The price you see is the price you pay — no hidden fees, ever.' },
    { icon: '🛡️', title: 'Reliability', text: 'Every car is inspected and maintained before it reaches you.' },
    { icon: '⚡', title: 'Speed', text: 'Book in minutes, pick up in minutes — we cut the paperwork.' },
    { icon: '🌍', title: 'Accessibility', text: 'Branches spread across the country, so there\'s always one nearby.' }
  ];

  timeline = [
    { year: '2022', text: 'FleetRent started with a single branch and a handful of cars.' },
    { year: '2023', text: 'Expanded to multiple cities and introduced online booking.' },
    { year: '2024', text: 'Crossed 10,000 completed rentals and grew the fleet significantly.' },
    { year: '2026', text: 'Rebuilt the platform from the ground up for a faster, smarter experience.' }
  ];
}
