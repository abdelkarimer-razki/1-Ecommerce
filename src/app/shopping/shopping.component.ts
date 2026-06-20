import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { products } from '../backend/products';
import { Title } from '@angular/platform-browser';
import { ShoppingserviceService } from '../services/shoppingservice.service';
import { TranslationService } from '../services/translation.service';


@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit, OnDestroy {
  allProducts: products[] = [];
  products: products[] = [];
  img: string[] = [];
  categories: string[] = [];
  pname: any = "";
  failed: boolean = false;
  loading: boolean = true;

  // Carousel State
  activeSlideIndex: number = 0;
  carouselInterval: any;

  // Filter States
  selectedCategory: string = 'TOUS';
  typeFilter: string = 'TOUS'; // TOUS, COMESTIBLE, NON_COMESTIBLE
  promoFilter: string = 'TOUS'; // TOUS, EN_PROMO, HORS_PROMO
  sortByFilter: string = 'DEFAULT'; // DEFAULT, PRICE_ASC, PRICE_DESC, NAME_ASC, NAME_DESC
  minPriceFilter: number | null = null;
  maxPriceFilter: number | null = null;

  // Autocomplete state
  suggestions: string[] = [];
  showSuggestions: boolean = false;
  activeSuggestionIndex: number = -1;

  constructor(
    private shop: ShoppingserviceService, 
    private sanitizer: DomSanitizer, 
    private router: Router, 
    private route: ActivatedRoute,
    private titleService: Title,
    public trans: TranslationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Always read filters directly from URL params — no localStorage redirect
      this.selectedCategory = params['category'] || 'TOUS';
      this.typeFilter = params['type'] || 'TOUS';
      this.pname = params['q'] || '';
      this.promoFilter = params['promo'] || 'TOUS';
      this.sortByFilter = params['sort'] || 'DEFAULT';
      this.minPriceFilter = params['minPrice'] ? Number(params['minPrice']) : null;
      this.maxPriceFilter = params['maxPrice'] ? Number(params['maxPrice']) : null;

      if (this.allProducts.length > 0) {
        this.executeFiltering();
      }
    });

    this.showAllData();
    this.loadCategories();
    this.titleService.setTitle("Shopping");
  }

  ngOnDestroy(): void {
    this.stopCarouselAutoPlay();
  }

  loadCategories() {
    this.shop.getCategories().subscribe(cats => {
      this.categories = cats || [];
    });
  }

  showAllData() {
    this.loading = true;
    this.shop.getAllProducts().subscribe(data => {
      this.allProducts = data || [];
      this.executeFiltering();
      this.loading = false;
      this.startCarouselAutoPlay();
    }, err => {
      console.error(err);
      this.loading = false;
    });
  }

  transform(pic: string) {
    if (!pic) return null;
    var re = /kigmfhhh/gi;
    var pic1 = pic.replace(re, "/");
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  getProductsCategorie(categorie: string) {
    if (this.selectedCategory === categorie) {
      this.selectedCategory = 'TOUS';
    } else {
      this.selectedCategory = categorie;
    }
    this.typeFilter = 'TOUS';
    this.applyFilters();
  }

  getProductsMangable(mangable: boolean) {
    const target = mangable ? 'COMESTIBLE' : 'NON_COMESTIBLE';
    if (this.typeFilter === target) {
      this.typeFilter = 'TOUS';
    } else {
      this.typeFilter = target;
    }
    this.selectedCategory = 'TOUS';
    this.applyFilters();
  }

  routerBuyProduct(product: products) {
    this.router.navigate(['/produit', product.idproducts]);
  }

  getMinPrice(prod: any): number {
    if (!prod.sizes || prod.sizes.length === 0) return Number(prod.prix) || 0;
    const prices = prod.sizes.map((s: any) => Number(s.prix) || 0).filter((p: number) => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : (Number(prod.prix) || 0);
  }

  getMaxPrice(prod: any): number {
    if (!prod.sizes || prod.sizes.length === 0) return Number(prod.prix) || 0;
    const prices = prod.sizes.map((s: any) => Number(s.prix) || 0).filter((p: number) => !isNaN(p));
    return prices.length > 0 ? Math.max(...prices) : (Number(prod.prix) || 0);
  }

  applyFilters() {
    this.updateUrlParams();
  }

  updateUrlParams() {
    const queryParams: any = {};
    if (this.selectedCategory && this.selectedCategory !== 'TOUS') {
      queryParams['category'] = this.selectedCategory;
    }
    if (this.typeFilter && this.typeFilter !== 'TOUS') {
      queryParams['type'] = this.typeFilter;
    }
    if (this.pname && this.pname.trim() !== '') {
      queryParams['q'] = this.pname;
    }
    if (this.promoFilter && this.promoFilter !== 'TOUS') {
      queryParams['promo'] = this.promoFilter;
    }
    if (this.sortByFilter && this.sortByFilter !== 'DEFAULT') {
      queryParams['sort'] = this.sortByFilter;
    }
    if (this.minPriceFilter !== null && this.minPriceFilter !== undefined) {
      queryParams['minPrice'] = this.minPriceFilter;
    }
    if (this.maxPriceFilter !== null && this.maxPriceFilter !== undefined) {
      queryParams['maxPrice'] = this.maxPriceFilter;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: ''
    });
  }

  executeFiltering() {
    let temp = [...this.allProducts];

    // Category filter
    if (this.selectedCategory && this.selectedCategory !== 'TOUS') {
      temp = temp.filter(p => p.categorie === this.selectedCategory);
    }

    // Comestibility (type) filter
    if (this.typeFilter && this.typeFilter !== 'TOUS') {
      const targetMangable = this.typeFilter === 'COMESTIBLE';
      temp = temp.filter(p => !!p.mangable === targetMangable);
    }

    // Name / description text search
    if (this.pname && this.pname.trim() !== '') {
      const q = this.pname.trim().toLowerCase();
      temp = temp.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Promo filter
    if (this.promoFilter && this.promoFilter !== 'TOUS') {
      if (this.promoFilter === 'EN_PROMO') {
        temp = temp.filter(p => p.prixf > 0);
      } else if (this.promoFilter === 'HORS_PROMO') {
        temp = temp.filter(p => !p.prixf || p.prixf === 0);
      }
    }

    // Price range filters
    if (this.minPriceFilter !== null && this.minPriceFilter !== undefined) {
      temp = temp.filter(p => this.getMaxPrice(p) >= this.minPriceFilter!);
    }
    if (this.maxPriceFilter !== null && this.maxPriceFilter !== undefined) {
      temp = temp.filter(p => this.getMinPrice(p) <= this.maxPriceFilter!);
    }

    // Sorting
    if (this.sortByFilter && this.sortByFilter !== 'DEFAULT') {
      temp.sort((a, b) => {
        if (this.sortByFilter === 'PRICE_ASC') {
          return this.getMinPrice(a) - this.getMinPrice(b);
        } else if (this.sortByFilter === 'PRICE_DESC') {
          return this.getMinPrice(b) - this.getMinPrice(a);
        } else if (this.sortByFilter === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        } else if (this.sortByFilter === 'NAME_DESC') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
    }

    this.products = temp;
    this.failed = this.products.length === 0;
  }

  onSearchChange() {
    const query = this.pname ? this.pname.trim().toLowerCase() : '';
    if (!query || query.length < 1) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
      this.applyFilters();
      return;
    }
    const matches = this.allProducts
      .filter(p => p.name.toLowerCase().includes(query))
      .map(p => p.name);
    this.suggestions = Array.from(new Set(matches)).slice(0, 8);
    this.showSuggestions = this.suggestions.length > 0;
    this.activeSuggestionIndex = -1;
    this.applyFilters();
  }

  onSearchKeyDown(event: KeyboardEvent) {
    if (!this.showSuggestions || this.suggestions.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Enter') {
      if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.suggestions.length) {
        event.preventDefault();
        this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
      } else {
        this.showSuggestions = false;
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
    }
  }

  onSearchBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(suggestion: string) {
    this.pname = suggestion;
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.applyFilters();
  }

  resetFilters() {
    this.selectedCategory = 'TOUS';
    this.typeFilter = 'TOUS';
    this.pname = '';
    this.promoFilter = 'TOUS';
    this.sortByFilter = 'DEFAULT';
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.suggestions = [];
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.applyFilters();
  }

  startCarouselAutoPlay() {
    this.stopCarouselAutoPlay();
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopCarouselAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  getHighlightedProducts(): products[] {
    return this.allProducts.filter(p => p.highlighted);
  }

  nextSlide() {
    const count = this.getHighlightedProducts().length;
    if (count > 0) {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % count;
    }
  }

  prevSlide() {
    const count = this.getHighlightedProducts().length;
    if (count > 0) {
      this.activeSlideIndex = (this.activeSlideIndex - 1 + count) % count;
    }
  }

  goToSlide(idx: number) {
    this.activeSlideIndex = idx;
    this.startCarouselAutoPlay();
  }

  transformToUrl(pic: string): string {
    if (!pic) return '';
    var re = /kigmfhhh/gi;
    return pic.replace(re, "/");
  }
}
