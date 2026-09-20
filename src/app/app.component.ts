import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { RouteLoaderComponent } from './shared/components/route-loader/route-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, RouteLoaderComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'FleetRent';
}
