import { TestService } from './../../core/services/test/test.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { log } from 'console';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly testService = inject(TestService)
  private readonly formBuilder = inject(FormBuilder);
  contactForm !: FormGroup;
  ngOnInit(): void {
    this.contactForm = this.formBuilder.group({
      name: ['' , [Validators.required , Validators.minLength(3)]],
      email: ['' , [Validators.required , Validators.email]],
      message: ['' , [Validators.required , Validators.minLength(10)]] 
    })
    this.testService.testapi().subscribe({
      next: (res)=>{
        console.log(res)
      }
    })
  }
  onSubmit(): void {}
}
