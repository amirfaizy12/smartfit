import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ScroolService } from '../../core/services/scrool/scrool.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  scroolService = inject(ScroolService);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.authService.syncAuthState();
    this.scroolService.scrolled$.subscribe((value) => {
      this.isScrolled = value;
    });
  }

  logout(): void {
    this.authService.logout(true);
  }
}
