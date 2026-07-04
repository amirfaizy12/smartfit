import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  forgetForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.forgetForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }

  submitRepass(): void {
    if (this.forgetForm.invalid) {
      this.forgetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email } = this.forgetForm.value;

    this.authService
      .forgotPassword({ email })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Reset link sent successfully.';

          const resetUrl = new URL(response.resetLink);
          const resetEmail = resetUrl.searchParams.get('email') ?? email;
          const token = resetUrl.searchParams.get('token');

          if (token) {
            this.router.navigate(['/auth/reset-password'], {
              queryParams: { email: resetEmail, token },
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = getApiErrorMessage(error, 'Could not send reset link. Please try again.');
        },
      });
  }
}
