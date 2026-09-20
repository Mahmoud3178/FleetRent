import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.css'
})
export class RegisterComponent implements OnInit {
  loading = signal(false);
  showPassword = signal(false);
  form!: FormGroup;

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      drivingLicenseNumber: [''],
      licenseExpiryDate: ['']
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.auth
      .register({
        ...value,
        role: 'Customer'
      } as any)
      .subscribe({
        next: () => {
          this.toast.success('تم إنشاء الحساب بنجاح، سجل دخولك الآن');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(this.toast.extractError(err));
        },
        complete: () => this.loading.set(false)
      });
  }
}
