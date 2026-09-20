import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('تم تسجيل الدخول بنجاح');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(this.toast.extractError(err) || 'بيانات الدخول غير صحيحة');
      },
      complete: () => this.loading.set(false)
    });
  }
}
