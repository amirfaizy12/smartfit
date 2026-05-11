import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-repassword',
  imports: [RouterLink],
  templateUrl: './repassword.component.html',
  styleUrl: './repassword.component.scss'
})
export class RepasswordComponent {
  loginPage= input<boolean>()
}
