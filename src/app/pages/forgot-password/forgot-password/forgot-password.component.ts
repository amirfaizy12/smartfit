import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder)
  forgetForm !: FormGroup;
  private router = inject(Router)
  ngOnInit(): void {
    this.forgetForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
    })

  }
  submitRepass() {

    if (this.forgetForm.invalid) {

      this.forgetForm.markAllAsTouched();
      return;

    }

    console.log(this.forgetForm.value);

    this.router.navigate(['/auth/verify-code']);
  }
}
