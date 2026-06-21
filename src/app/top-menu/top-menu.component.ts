import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { HomepageService } from '../services/homepage.service';
import { CartService } from '../services/cart.service';
import { TranslationService } from '../services/translation.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  menuMore: boolean = false;
  name: any;
  email: any;
  cartCount: number = 0;
  config: any = {};

  constructor(
    public log: LoginService,
    private route: Router,
    private homepage: HomepageService,
    private cartService: CartService,
    public trans: TranslationService,
    private sanitizer: DomSanitizer
  ) {
    route.events.subscribe((val) => {
      this.disableMenu();
      this.name = localStorage.getItem('user');
      this.email = localStorage.getItem('userE');
    });
  }

  ngOnInit(): void {
    // Load config for dynamic brand details (Coop Name & Logo)
    this.homepage.getConfig().subscribe(
      (data) => {
        this.config = data || {};
      },
      (error) => {
        console.error('Error loading config in TopMenu:', error);
      }
    );

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((s, i) => s + i.qte, 0);
    });
  }

  showMenu() {
    this.menuMore = !this.menuMore;
  }

  disableMenu() {
    this.menuMore = false;
  }

  transformImage(pic: string) {
    if (!pic) return '';
    if (pic.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(pic);
    }
    return pic;
  }
}
