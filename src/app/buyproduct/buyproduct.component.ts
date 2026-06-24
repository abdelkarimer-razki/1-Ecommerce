import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-buyproduct',
  templateUrl: './buyproduct.component.html',
  styleUrls: ['./buyproduct.component.css']
})
export class BuyproductComponent implements OnInit, OnDestroy {
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
    public trans: TranslationService,
    private seoService: SeoService
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

  ngOnDestroy(): void {
    this.seoService.removeSchema();
  }

  loadProductDetails() {
    this.buyService.getProducts(this.id).subscribe(data => {
      this.product = data;
      this.loading = false;
      if (this.product && this.product[0]) {
        const prod = this.product[0];
        if (!prod.sizes || prod.sizes.length === 0) {
          prod.sizes = [];
          if (prod.taille && prod.taille !== '0') {
            prod.sizes.push({ taille: String(prod.taille), prix: Number(prod.prix) });
          }
          if (prod.taille2 && prod.taille2 !== '0') {
            prod.sizes.push({ taille: String(prod.taille2), prix: Number(prod.prix2) });
          }
          if (prod.taille3 && prod.taille3 !== '0') {
            prod.sizes.push({ taille: String(prod.taille3), prix: Number(prod.prix3) });
          }
        }
        if (prod.sizes && prod.sizes.length > 0) {
          this.selectedSize = prod.sizes[0];
        } else {
          this.selectedSize = { taille: '', prix: Number(prod.prix) || 0 };
        }

        // Set Dynamic Translated SEO Title, Meta Tags & OG Tags
        const name = this.trans.pName(prod);
        const desc = this.trans.pDesc(prod);
        const cleanDesc = desc ? (desc.length > 155 ? desc.substring(0, 152) + '...' : desc) : `${name} - COOP BABMANSOUR`;
        const imagePath = prod.picture ? window.location.origin + '/' + prod.picture.replace(/kigmfhhh/gi, '/') : '';
        const keywords = [name, prod.name, prod.name_en, prod.name_ar, prod.categorie, 'Coopérative Bab Mansour', 'Maroc'].filter(Boolean).join(', ');

        this.seoService.generateTags({
          title: name,
          description: cleanDesc,
          keywords: keywords,
          image: imagePath,
          type: 'product'
        });

        // Set JSON-LD Schema.org Structured Data
        const price = this.selectedSize ? this.selectedSize.prix : prod.prix || 0;
        const schema = {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          'name': name,
          'image': [ imagePath ],
          'description': desc || cleanDesc,
          'category': prod.categorie,
          'offers': {
            '@type': 'Offer',
            'url': window.location.href,
            'priceCurrency': 'MAD',
            'price': price,
            'availability': 'https://schema.org/InStock',
            'itemCondition': 'https://schema.org/NewCondition'
          }
        };
        this.seoService.setSchema(schema);

        // Check if already in cart
        const cartItems = this.cartService.getItems();
        this.addedToCart = cartItems.some(i => i.idproducts === Number(this.id));

        // Load similar products
        this.loadSimilarProducts(prod);
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
