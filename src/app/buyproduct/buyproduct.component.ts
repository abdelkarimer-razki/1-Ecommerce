import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { products } from '../backend/products';
import { BuyproductService } from '../services/buyproduct.service';
import { Title } from '@angular/platform-browser';
import { LoginService } from '../services/login.service';
import { CartService } from '../services/cart.service';
import { ShoppingserviceService } from '../services/shoppingservice.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-buyproduct',
  templateUrl: './buyproduct.component.html',
  styleUrls: ['./buyproduct.component.css']
})
export class BuyproductComponent implements OnInit {
   id: String = '';
   loading: boolean = true;
   qte: any = 1;
   addedToCart: boolean = false;
   admin: boolean = false;
   selectedSize: any = null;

   product: products[] = [];
   similarProducts: products[] = [];

  constructor(
    private route: ActivatedRoute,
    private login: LoginService,
    private router: Router,
    private buyService: BuyproductService,
    private shopService: ShoppingserviceService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private cartService: CartService,
    public trans: TranslationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('idproducts') || '';
      this.loading = true;
      this.product = [];
      this.similarProducts = [];
      this.qte = 1;
      this.addedToCart = false;
      this.selectedSize = null;
      this.loadProductDetails();
    });

    if (this.login.isntAdmin()) {
      this.admin = true;
    }
  }

  loadProductDetails() {
    this.buyService.getProducts(this.id).subscribe(data => {
      this.product = data;
      this.loading = false;
      if (this.product && this.product[0]) {
        if (!this.product[0].sizes || this.product[0].sizes.length === 0) {
          this.product[0].sizes = [];
          if (this.product[0].taille && this.product[0].taille !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille), prix: Number(this.product[0].prix) });
          }
          if (this.product[0].taille2 && this.product[0].taille2 !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille2), prix: Number(this.product[0].prix2) });
          }
          if (this.product[0].taille3 && this.product[0].taille3 !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille3), prix: Number(this.product[0].prix3) });
          }
        }
        if (this.product[0].sizes && this.product[0].sizes.length > 0) {
          this.selectedSize = this.product[0].sizes[0];
        } else {
          // Fallback: use prix directly from product even if no sizes configured
          this.selectedSize = { taille: '', prix: Number(this.product[0].prix) || 0 };
        }
        this.titleService.setTitle(this.product[0].name);

        // Check if already in cart
        const cartItems = this.cartService.getItems();
        this.addedToCart = cartItems.some(i => i.idproducts === Number(this.id));

        // Load similar products
        this.loadSimilarProducts(this.product[0]);
      }
    });
  }

  loadSimilarProducts(currentProduct: products) {
    this.shopService.getAllProducts().subscribe(allProds => {
      if (allProds) {
        this.similarProducts = allProds.filter(p => 
          p.categorie === currentProduct.categorie && 
          Number(p.idproducts) !== Number(currentProduct.idproducts)
        ).slice(0, 4); // Suggest up to 4 similar products
      }
    });
  }

  transform(pic: string) {
    if (!pic) return '';
    const re = /kigmfhhh/gi;
    const pic1 = pic.replace(re, '/');
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  selectSize(size: any) {
    this.selectedSize = size;
    // Re-check cart status when size changes
    const cartItems = this.cartService.getItems();
    this.addedToCart = cartItems.some(i =>
      i.idproducts === Number(this.id) && i.taille === size.taille
    );
  }

  addToCart(item: any) {
    // Use selectedSize if available, otherwise fall back to product price
    const taille = this.selectedSize ? this.selectedSize.taille : '';
    const prix = this.selectedSize ? Number(this.selectedSize.prix) : Number(item.prix) || 0;

    this.cartService.addItem({
      idproducts: Number(item.idproducts),
      name: item.name,
      picture: item.picture,
      taille: taille,
      prix: prix,
      qte: Number(this.qte) || 1
    });
    this.addedToCart = true;
  }

  goToCheckout(item: any) {
    this.addToCart(item);
    this.router.navigate(['/checkout']);
  }

  viewProduct(prod: products) {
    this.router.navigate(['/produit', prod.idproducts]);
  }
}
