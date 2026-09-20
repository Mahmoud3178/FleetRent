import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="status-page">
      <div class="status-emoji">🔒</div>
      <h1>403</h1>
      <p>You don't have permission to access this page.</p>
      <a routerLink="/" class="btn btn-accent mt-16">Back to Home</a>
    </div>
  `,
  styles: [`
    .status-page { min-height: calc(100vh - 68px); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 40px; }
    .status-emoji { font-size: 64px; margin-bottom: 8px; }
    h1 { font-size: 48px; }
  `]
})
export class ForbiddenComponent {}
