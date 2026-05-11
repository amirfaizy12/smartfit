import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validateHeaderValue } from 'node:http';
import { RepasswordComponent } from "../repassword/repassword.component";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RepasswordComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder)
  loginForm !: FormGroup;
  private router = inject(Router)
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null , [Validators.required , Validators.email]],
      password: [null , [Validators.required , Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]]
    })

  }
  submitLogin(){
    console.log('loginn')
    this.router.navigate(['home']);
  }
}
