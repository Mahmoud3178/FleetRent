import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/enums';

/**
 * استخدام: canActivate: [roleGuard(['Admin'])]
 * أو: canActivate: [roleGuard(['Admin', 'Employee'])]
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (auth.hasRole(...allowedRoles)) return true;

    router.navigate(['/forbidden']);
    return false;
  };
}
