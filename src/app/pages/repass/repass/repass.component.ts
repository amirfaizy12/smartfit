import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// ✅ Custom Validator: يتأكد إن الباسورد والكونفيرم متطابقين
function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-repass',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './repass.component.html',
  styleUrl: './repass.component.scss'
})
export class RepassComponent {

  repassForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.repassForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(10)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }  // ✅ Group-level validator
    );
  }

  // ✅ Getters للـ requirements list
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

  submitPassword() {
    if (this.repassForm.valid) {
      console.log('New Password:', this.repassForm.value.password);
      // API هنا
      this.router.navigate(['/auth/login']);
    } else {
      this.repassForm.markAllAsTouched();
    }
  }
}