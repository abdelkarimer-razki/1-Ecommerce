import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Ecommerce';

  constructor(private router: Router, private trans: TranslationService) {}

  ngOnInit(): void {
    const dir = this.trans.isRtl() ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
