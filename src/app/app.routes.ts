import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent)
  },

  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent)
  },

  // ===== Auth =====
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },

  // ===== Cars (public browsing) =====
  {
    path: 'cars',
    loadComponent: () =>
      import('./features/cars/car-list/car-list.component').then((m) => m.CarListComponent)
  },
  {
    path: 'cars/:id',
    loadComponent: () =>
      import('./features/cars/car-details/car-details.component').then((m) => m.CarDetailsComponent)
  },

  // ===== Bookings (Customer) =====
  {
    path: 'bookings/my',
    canActivate: [authGuard, roleGuard(['Customer'])],
    loadComponent: () =>
      import('./features/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent)
  },

  // ===== Bookings (Employee/Admin management) =====
  {
    path: 'admin/bookings',
    canActivate: [authGuard, roleGuard(['Employee', 'Admin'])],
    loadComponent: () =>
      import('./features/bookings/admin-bookings/admin-bookings.component').then((m) => m.AdminBookingsComponent)
  },

  // ===== Contracts (Employee/Admin) =====
  {
    path: 'contracts',
    canActivate: [authGuard, roleGuard(['Employee', 'Admin'])],
    loadComponent: () =>
      import('./features/contracts/contracts.component').then((m) => m.ContractsComponent)
  },

  // ===== Maintenance (Employee/Admin) =====
  {
    path: 'maintenance',
    canActivate: [authGuard, roleGuard(['Employee', 'Admin'])],
    loadComponent: () =>
      import('./features/maintenance/maintenance.component').then((m) => m.MaintenanceComponent)
  },

  // ===== Payments (Employee/Admin) =====
  {
    path: 'payments',
    canActivate: [authGuard, roleGuard(['Employee', 'Admin'])],
    loadComponent: () =>
      import('./features/payments/payments.component').then((m) => m.PaymentsComponent)
  },

  // ===== Admin only =====
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      )
  },
  {
    path: 'admin/branches',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/branches/branches.component').then((m) => m.BranchesComponent)
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent)
  },
  {
    path: 'admin/cars/new',
    canActivate: [authGuard, roleGuard(['Admin', 'Employee'])],
    loadComponent: () =>
      import('./features/cars/car-form/car-form.component').then((m) => m.CarFormComponent)
  },
  {
    path: 'admin/cars/:id/edit',
    canActivate: [authGuard, roleGuard(['Admin', 'Employee'])],
    loadComponent: () =>
      import('./features/cars/car-form/car-form.component').then((m) => m.CarFormComponent)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/users/users.component').then((m) => m.UsersComponent)
  },

  // ===== Status pages =====
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
