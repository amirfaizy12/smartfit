import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlowbiteService } from './core/services/flowbite/flowbite.service';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    private readonly authService = inject(AuthService);
    constructor(private flowbiteService: FlowbiteService) { }

  ngOnInit(): void {
    this.authService.syncAuthState();
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }
}
