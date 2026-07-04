import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-repass',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './repass.component.html',
  styleUrl: './repass.component.scss',
})
export class RepassComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  repassForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(10)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  email = '';
  token = '';
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email') ?? '';
      this.token = params.get('token') ?? '';
    });
  }

  get passwordValue(): string {
    return this.repassForm.get('password')?.value || '';
  }

  get hasMinLength(): boolean {
    return this.passwordValue.length >= 10;
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*?]/.test(this.passwordValue);
  }

  submitPassword(): void {
    if (this.repassForm.invalid) {
      this.repassForm.markAllAsTouched();
      return;
    }

    if (!this.email || !this.token) {
      this.errorMessage = 'Reset token is missing. Please request a new reset link.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: this.repassForm.value.password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error, 'Could not reset password. Please try again.');
        },
      });
  }
}
