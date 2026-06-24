import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { products } from '../backend/products';
import { TranslationService } from '../services/translation.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @Input() onlyModal: boolean = false;
  @Output() closeModalEvent = new EventEmitter<boolean>();

  produits: any;
  loading: boolean = true;
  myimage: any;
  
  // Modal states
  modalActive: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  productFormSubmitted: boolean = false;
  activeTab: string = 'basic';
  
  product: products = {idproducts:0,name:"",picture:"",description:"",prix:0,categorie:"null",mangable:false,prixf:0,taille:"0",taille2:"0",taille3:"0",prix2:0,prix3:0,sizes:[]};
  editingProduct: products = {idproducts:0,name:"",picture:"",description:"",prix:0,categorie:"null",mangable:false,prixf:0,taille:"0",taille2:"0",taille3:"0",prix2:0,prix3:0,sizes:[]};
  
  showNewCategoryInput: boolean = false;
  newCategoryName: string = '';
  originalImage: string = '';
  toleranceThreshold: number = 35;
  
  viewModalActive: boolean = false;
  viewedProduct: products | null = null;
  
  deleteModalActive: boolean = false;
  deletingProduct: products | null = null;
  
  more: Boolean[] = [];
  details: Boolean[] = [];
  pname: any = "";
  
  // Categories state
  registeredCategories: string[] = [];
  selectedCategoryFilter: string = 'TOUS';
  allProducts: any[] = [];
  categoriesModalActive: boolean = false;
  newCategoryFormName: string = '';
 
  // Advanced search & filters state
  typeFilter: string = 'TOUS';
  promoFilter: string = 'TOUS';
  highlightFilter: string = 'TOUS'; // TOUS, HIGHLIGHTED, NOT_HIGHLIGHTED
  sortByFilter: string = 'DEFAULT';
  minPriceFilter: number | null = null;
  maxPriceFilter: number | null = null;
 
  // Autocomplete state
  suggestions: string[] = [];
  showSuggestions: boolean = false;
  activeSuggestionIndex: number = -1;
 
  // Context menu dropdown
  activeDropdownProduct: any = null;
  dropdownPosition = { top: 0, left: 0 };
  showDropdown: boolean = false;
 
  constructor(
    private sanitizer: DomSanitizer,
    private dash: DashboardService,
    public trans: TranslationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.onlyModal) {
      this.loadCategories();
      this.openAddModal();
    } else {
      this.loadProducts();
      this.loadCategories();
      this.route.queryParams.subscribe(params => {
        if (params['action'] === 'add') {
          this.openAddModal();
        }
      });
    }
  }

  loadProducts() {
    this.dash.showproducts().subscribe(data => {
      this.allProducts = (data as any[]) || [];
      this.applyFilter();
      this.loading = false;
    });
  }

  openAddModal() {
    this.modalMode = 'add';
    this.activeTab = 'basic';
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.originalImage = '';
    this.toleranceThreshold = 35;
    this.productFormSubmitted = false;
    this.product = {
      idproducts: 0,
      name: "",
      name_en: "",
      name_ar: "",
      picture: "",
      description: "",
      description_en: "",
      description_ar: "",
      prix: 0,
      categorie: "MIEL",
      mangable: true,
      prixf: 0,
      taille: "0",
      taille2: "0",
      taille3: "0",
      prix2: 0,
      prix3: 0,
      sizes: [{ taille: '', prix: 0 }]
    };
    this.myimage = '';
    this.modalActive = true;
  }

  autoTranslateProduct() {
    const active = this.activeProduct();
    if (active.name && active.name.trim() !== '') {
      this.trans.translateText(active.name, 'EN').then(res => active.name_en = res);
      this.trans.translateText(active.name, 'AR').then(res => active.name_ar = res);
    }
    if (active.description && active.description.trim() !== '') {
      this.trans.translateText(active.description, 'EN').then(res => active.description_en = res);
      this.trans.translateText(active.description, 'AR').then(res => active.description_ar = res);
    }
  }

  openEditModal(prod: any) {
    this.modalMode = 'edit';
    this.activeTab = 'basic';
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.toleranceThreshold = 35;
    this.productFormSubmitted = false;
    this.editingProduct = JSON.parse(JSON.stringify(prod));
    
    if (!this.editingProduct.sizes || this.editingProduct.sizes.length === 0) {
      this.editingProduct.sizes = [];
      if (this.editingProduct.taille && this.editingProduct.taille !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille), prix: Number(this.editingProduct.prix) });
      }
      if (this.editingProduct.taille2 && this.editingProduct.taille2 !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille2), prix: Number(this.editingProduct.prix2) });
      }
      if (this.editingProduct.taille3 && this.editingProduct.taille3 !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille3), prix: Number(this.editingProduct.prix3) });
      }
    }
    if (this.editingProduct.sizes.length === 0) {
      this.editingProduct.sizes.push({ taille: '', prix: 0 });
    }

    var re = /kigmfhhh/gi;
    this.myimage = this.editingProduct.picture ? this.editingProduct.picture.replace(re, "/") : '';
    this.originalImage = this.myimage;
    this.modalActive = true;
  }

  closeModal() {
    this.modalActive = false;
    if (!this.onlyModal) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { action: null },
        queryParamsHandling: 'merge'
      });
    }
    this.closeModalEvent.emit(false);
  }

  openViewModal(prod: any) {
    this.viewedProduct = JSON.parse(JSON.stringify(prod));
    
    if (this.viewedProduct && (!this.viewedProduct.sizes || this.viewedProduct.sizes.length === 0)) {
      this.viewedProduct.sizes = [];
      if (this.viewedProduct.taille && this.viewedProduct.taille !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille), prix: Number(this.viewedProduct.prix) });
      }
      if (this.viewedProduct.taille2 && this.viewedProduct.taille2 !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille2), prix: Number(this.viewedProduct.prix2) });
      }
      if (this.viewedProduct.taille3 && this.viewedProduct.taille3 !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille3), prix: Number(this.viewedProduct.prix3) });
      }
    }
    
    this.viewModalActive = true;
  }

  closeViewModal() {
    this.viewModalActive = false;
    this.viewedProduct = null;
  }

  activeProduct(): products {
    return this.modalMode === 'add' ? this.product : this.editingProduct;
  }

  getCategories(): string[] {
    return this.registeredCategories.length > 0 ? this.registeredCategories : ['MIEL', 'HUILE'];
  }

  onCategoryChange(val: string) {
    if (val === '_NEW_') {
      this.showNewCategoryInput = true;
      this.newCategoryName = '';
    } else {
      this.showNewCategoryInput = false;
    }
  }

  cancelNewCategory() {
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.activeProduct().categorie = 'MIEL';
  }

  removeBg() {
    if (!this.originalImage) return;
    
    const img = new Image();
    img.src = this.originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Get background color from the first pixel (top-left)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const threshold = this.toleranceThreshold;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate Euclidean distance between pixel color and background color
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );
        
        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      this.myimage = canvas.toDataURL('image/png');
    };
  }

  resetBg() {
    if (this.originalImage) {
      this.myimage = this.originalImage;
      this.toleranceThreshold = 35;
    }
  }

  clearImage() {
    this.myimage = '';
    this.originalImage = '';
    this.toleranceThreshold = 35;
  }

  addSizeVariation() {
    const active = this.activeProduct();
    if (!active.sizes) {
      active.sizes = [];
    }
    active.sizes.push({ taille: '', prix: 0 });
  }

  removeSizeVariation(index: number) {
    const active = this.activeProduct();
    if (active.sizes && active.sizes.length > 1) {
      active.sizes.splice(index, 1);
    }
  }

  submitModal() {
    this.productFormSubmitted = true;
    const active = this.activeProduct();

    if (!active.name || active.name.trim() === '') {
      return;
    }

    if (this.showNewCategoryInput) {
      if (!this.newCategoryName || this.newCategoryName.trim() === '') {
        return;
      }
    } else {
      if (!active.categorie || active.categorie === 'null') {
        return;
      }
    }

    if (!active.sizes || active.sizes.length === 0) {
      return;
    }
    for (const size of active.sizes) {
      if (!size.taille || size.taille.trim() === '' || size.prix === undefined || size.prix === null || size.prix <= 0) {
        return;
      }
    }

    var re = /[/]/gi;
    let finalPic = '';
    if (this.myimage) {
      finalPic = this.myimage.replace(re, "kigmfhhh");
    }

    active.picture = finalPic;

    if (this.showNewCategoryInput && this.newCategoryName) {
      active.categorie = this.newCategoryName;
    }

    // Fill legacy columns for compatibility
    if (active.sizes) {
      active.taille = active.sizes[0] ? active.sizes[0].taille : '0';
      active.prix = active.sizes[0] ? active.sizes[0].prix : 0;
      active.taille2 = active.sizes[1] ? active.sizes[1].taille : '0';
      active.prix2 = active.sizes[1] ? active.sizes[1].prix : 0;
      active.taille3 = active.sizes[2] ? active.sizes[2].taille : '0';
      active.prix3 = active.sizes[2] ? active.sizes[2].prix : 0;
    }

    if (this.modalMode === 'add') {
      this.dash.addproduct(this.product).subscribe(data => {
        this.modalActive = false;
        if (!this.onlyModal) {
          this.loadProducts();
          this.loadCategories();
        }
        this.closeModalEvent.emit(true);
      });
    } else {
      this.dash.updateProduct(this.editingProduct).subscribe(data => {
        this.modalActive = false;
        if (!this.onlyModal) {
          this.loadProducts();
          this.loadCategories();
        }
        this.closeModalEvent.emit(true);
      });
    }
  }

  showmor(a: any) {
    var s = document.getElementById(a.toString());
    if (s?.style.display == "none") {
      if (s) s.style.display = "revert"
    } else {
      if (s) s.style.display = "none"
    }
  }

  turnoff(i: any) {
    for (var j = 0; j < this.details.length; j++) {
      if (i != j) {
        this.details[j] = false;
      }
    }
    for (var j = 0; j < this.more.length; j++) {
      if (i != j) {
        this.more[j] = false;
      }
    }
  }

  disable(a: Number) {
    var i;
    var s = document.getElementsByClassName("more");
    for (i = 0; i < s.length; i++) {
      var v = document.getElementById(i.toString());
      if (i != a) {
        if (v?.style.display != "none") {
          if (v) v.style.display = "none"
        }
      }
    }
  }

  disableD(a: any) {
    var i;
    var s = document.getElementsByClassName("details");
    for (i = 0; i < s.length; i++) {
      var v = document.getElementById(i.toString() + 'a');
      if (i + 'a' != a) {
        if (v?.style.display != "none") {
          if (v) v.style.display = "none"
        }
      }
    }
  }

  onChange($event: Event) {
    const file = ($event.target as HTMLInputElement);
    if (file.files != null && file.files.length > 0)
      this.convertToBase64(file.files[0]);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      this.myimage = d;
      this.originalImage = d;
      this.toleranceThreshold = 35;
    });
  }

  transform(pic: string) {
    if (!pic) return null;
    var re = /kigmfhhh/gi;
    var pic1 = pic.replace(re, "/");
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);

    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = (error) => {
      subscriber.error(error);
      subscriber.complete();
    };
  }

  loadCategories() {
    this.dash.getAllCategories().subscribe((cats: any) => {
      this.registeredCategories = (cats || []).map((c: any) => typeof c === 'string' ? c : c.name);
    });
  }

  applyFilter() {
    let temp = [...this.allProducts];
    if (this.selectedCategoryFilter && this.selectedCategoryFilter !== 'TOUS') {
      temp = temp.filter(p => p.categorie === this.selectedCategoryFilter);
    }
    if (this.pname && this.pname.trim() !== '') {
      const q = this.pname.trim().toLowerCase();
      temp = temp.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (this.typeFilter && this.typeFilter !== 'TOUS') {
      const targetMangable = this.typeFilter === 'COMESTIBLE';
      temp = temp.filter(p => !!p.mangable === targetMangable);
    }
    if (this.promoFilter && this.promoFilter !== 'TOUS') {
      if (this.promoFilter === 'EN_PROMO') {
        temp = temp.filter(p => p.prixf > 0);
      } else if (this.promoFilter === 'HORS_PROMO') {
        temp = temp.filter(p => !p.prixf || p.prixf === 0);
      }
    }
    if (this.highlightFilter && this.highlightFilter !== 'TOUS') {
      const targetHighlight = this.highlightFilter === 'HIGHLIGHTED';
      temp = temp.filter(p => !!p.highlighted === targetHighlight);
    }
    if (this.minPriceFilter !== null && this.minPriceFilter !== undefined) {
      temp = temp.filter(p => this.getMaxPrice(p) >= this.minPriceFilter!);
    }
    if (this.maxPriceFilter !== null && this.maxPriceFilter !== undefined) {
      temp = temp.filter(p => this.getMinPrice(p) <= this.maxPriceFilter!);
    }
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
    this.produits = temp;
  }

  onSearchChange() {
    const query = this.pname ? this.pname.trim().toLowerCase() : '';
    if (!query || query.length < 1) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
      this.applyFilter();
      return;
    }
    const matches = this.allProducts
      .filter(p => p.name.toLowerCase().includes(query))
      .map(p => p.name);
    this.suggestions = Array.from(new Set(matches)).slice(0, 8);
    this.showSuggestions = this.suggestions.length > 0;
    this.activeSuggestionIndex = -1;
    this.applyFilter();
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
    this.applyFilter();
  }

  resetFilters() {
    this.selectedCategoryFilter = 'TOUS';
    this.pname = '';
    this.typeFilter = 'TOUS';
    this.promoFilter = 'TOUS';
    this.highlightFilter = 'TOUS';
    this.sortByFilter = 'DEFAULT';
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.suggestions = [];
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.applyFilter();
  }

  openCategoriesModal() {
    this.newCategoryFormName = '';
    this.categoriesModalActive = true;
  }

  closeCategoriesModal() {
    this.categoriesModalActive = false;
  }

  addCategoryFromForm() {
    if (!this.newCategoryFormName || this.newCategoryFormName.trim() === '') return;
    this.dash.addCategory(this.newCategoryFormName).subscribe(() => {
      this.newCategoryFormName = '';
      this.loadCategories();
    });
  }

  deleteCategoryFromList(catName: string) {
    if (catName === 'MIEL' || catName === 'HUILE') {
      alert(this.trans.t('DEFAULT_CAT_DELETE_ERROR'));
      return;
    }
    if (confirm(`${this.trans.t('SUPPRIMER_CATEGORIE_WARN_START')}"${catName}"${this.trans.t('SUPPRIMER_CATEGORIE_WARN_END')}`)) {
      this.dash.deleteCategory(catName).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  change() {
    this.applyFilter();
  }

  confirmDelete(prod: any) {
    this.deletingProduct = prod;
    this.deleteModalActive = true;
  }

  closeDeleteModal() {
    this.deleteModalActive = false;
    this.deletingProduct = null;
  }

  executeDelete() {
    if (this.deletingProduct) {
      this.dash.deleteproduct(this.deletingProduct.idproducts).subscribe(data => {
        this.closeDeleteModal();
        this.loadProducts();
      });
    }
  }

  deletepro(id: any) {
    this.dash.deleteproduct(id).subscribe(data => {
      this.loadProducts();
    });
  }

  toggleDropdown(event: MouseEvent, prod: any) {
    event.stopPropagation();
    if (this.activeDropdownProduct?.idproducts === prod.idproducts && this.showDropdown) {
      this.showDropdown = false;
      this.activeDropdownProduct = null;
      return;
    }
    
    this.activeDropdownProduct = prod;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 120
    };
    this.showDropdown = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.showDropdown = false;
    this.activeDropdownProduct = null;
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

  toggleHighlight(prod: any) {
    const nextVal = !prod.highlighted;
    this.dash.toggleProductHighlight(prod.idproducts, nextVal).subscribe(() => {
      prod.highlighted = nextVal;
    }, err => {
      console.error(err);
      alert(this.trans.t('HIGHLIGHT_ERROR'));
    });
  }
}
