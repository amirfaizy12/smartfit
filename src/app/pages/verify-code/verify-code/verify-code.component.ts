import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-code',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss'
})
export class VerifyCodeComponent {

  @ViewChild('input6') lastInput!: ElementRef<HTMLInputElement>;

  verifyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      code1: ['', [Validators.required]],
      code2: ['', [Validators.required]],
      code3: ['', [Validators.required]],
      code4: ['', [Validators.required]],
      code5: ['', [Validators.required]],
      code6: ['', [Validators.required]],
    });
  }

  moveToNext(event: any, nextInput?: HTMLInputElement, prevInput?: HTMLInputElement) {
    const input = event.target;
    const value = input.value;

    // Allow only numbers
    input.value = value.replace(/[^0-9]/g, '');

    // Move forward
    if (value && nextInput) {
      nextInput.focus();
    }

    // Backspace يرجع
    if (event.key === 'Backspace' && !value && prevInput) {
      prevInput.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text');
    if (!pastedData) return;

    const numbers = pastedData.replace(/\D/g, '').split('');
    if (numbers.length !== 6) return;

    this.verifyForm.patchValue({
      code1: numbers[0],
      code2: numbers[1],
      code3: numbers[2],
      code4: numbers[3],
      code5: numbers[4],
      code6: numbers[5],
    });

    // Focus على آخر input بعد الـ paste
    this.lastInput.nativeElement.focus();
  }

  submitCode() {
    if (this.verifyForm.valid) {
      const otpCode =
        this.verifyForm.value.code1 +
        this.verifyForm.value.code2 +
        this.verifyForm.value.code3 +
        this.verifyForm.value.code4 +
        this.verifyForm.value.code5 +
        this.verifyForm.value.code6;

      console.log(otpCode);

      // API هنا

      this.router.navigate(['/auth/reset-password']);

    } else {
      this.verifyForm.markAllAsTouched();
    }
  }
}