import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { CartService, CartItem } from '../services/cart.service';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  total: number = 0;
  loading = false;
  submitted = false;
  error = '';

  checkoutFormSubmitted = false;

  form = {
    fullname: '',
    tel: '',
    email: '',
    adress: ''
  };

  constructor(
    private cart: CartService,
    private dash: DashboardService,
    private router: Router,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    public trans: TranslationService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('FINALISER_COMMANDE'));
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();

    // Prefill from localStorage if logged in
    const user = localStorage.getItem('user');
    const email = localStorage.getItem('userE');
    if (user) this.form.fullname = user;
    if (email) this.form.email = email;
    // No auto-redirect — show empty cart message instead
  }

  updateQte(item: CartItem, delta: number) {
    const newQte = item.qte + delta;
    if (newQte < 1) {
      this.cart.removeItem(item.idproducts, item.taille);
    } else {
      this.cart.updateQte(item.idproducts, item.taille, newQte);
    }
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();
  }

  removeItem(item: CartItem) {
    this.cart.removeItem(item.idproducts, item.taille);
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();
  }

  transform(pic: string): any {
    if (!pic) return '';
    const re = /kigmfhhh/gi;
    const pic1 = pic.replace(re, '/');
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  submitOrder() {
    this.checkoutFormSubmitted = true;
    if (!this.form.fullname || !this.form.tel) {
      this.error = this.trans.t('CHECKOUT_REQUIRED_ERROR');
      return;
    }
    this.loading = true;
    this.error = '';

    const order = {
      fullname: this.form.fullname,
      tel: this.form.tel,
      email: this.form.email,
      adress: this.form.adress,
      source: 'site',
      items: this.items.map(i => ({
        idproducts: i.idproducts,
        taille: i.taille,
        qte: i.qte,
        prix: i.prix
      }))
    };

    this.dash.checkout(order).subscribe(
      (res: any) => {
        this.cart.clear();
        this.loading = false;
        this.submitted = true;
      },
      (err) => {
        this.loading = false;
        this.error = this.trans.t('GENERIC_ERROR');
        console.error(err);
      }
    );
  }
}
