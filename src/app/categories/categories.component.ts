import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Input() onlyModal: boolean = false;
  @Output() closeModalEvent = new EventEmitter<boolean>();

  categories: any[] = [];
  allProducts: any[] = [];
  loading: boolean = true;
  
  // Sophisticated preset colors representing natural Morrocan ingredients/products
  presetColors: string[] = [
    '#fef3c7', // Honey Gold
    '#ecfdf5', // Olive Leaf Green
    '#ffedd5', // Terracotta Clay Orange
    '#f5f5dc', // Almond Cream (Beige)
    '#f3e8ff', // Lavender Mist
    '#ffe4e6', // Soft Rose Petal
    '#e0f2fe', // Sky Mist
    '#f1f5f9'  // Mineral Slate Grey
  ];

  // Active dropdown row identifier
  activeDropdownCategory: string | null = null;

  // Add category popup states
  addModalActive: boolean = false;
  newCategoryName: string = '';
  categoryPicture: string = '';
  categoryOriginalPicture: string = '';
  categoryBgColor: string = '#fef3c7'; // default to honey gold
  toleranceThresholdAdd: number = 35;
  categoryFormSubmitted: boolean = false;

  // Edit category modal states
  editModalActive: boolean = false;
  editingCategory: any = null;
  myimage: string = '';
  originalImage: string = '';
  toleranceThresholdEdit: number = 35;
  editCategoryBgColor: string = '';

  // Delete category confirmation modal states
  deleteModalActive: boolean = false;
  deletingCategory: string | null = null;

  constructor(
    private dash: DashboardService,
    private titleService: Title,
    public trans: TranslationService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('CATEGORIES_SECTION'));
    if (this.onlyModal) {
      this.openAddModal();
    } else {
      this.loadData();
      this.route.queryParams.subscribe(params => {
        if (params['action'] === 'add') {
          this.openAddModal();
        }
      });
    }
  }

  loadData() {
    this.loading = true;
    this.dash.getAllCategories().subscribe((cats: any) => {
      this.categories = cats || [];
      this.dash.showproducts().subscribe((prods: any) => {
        this.allProducts = prods || [];
        this.loading = false;
      }, err => {
        console.error(err);
        this.loading = false;
      });
    }, err => {
      console.error(err);
      this.loading = false;
    });
  }

  getProductCount(cat: string): number {
    return this.allProducts.filter(p => p.categorie === cat).length;
  }

  transform(pic: string) {
    if (!pic) return null;
    var re = /kigmfhhh/gi;
    var pic1 = pic.replace(re, "/");
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  openAddModal() {
    this.newCategoryName = '';
    this.categoryPicture = '';
    this.categoryOriginalPicture = '';
    this.categoryBgColor = '#fef3c7';
    this.toleranceThresholdAdd = 35;
    this.categoryFormSubmitted = false;
    this.addModalActive = true;
  }

  closeAddModal(saved: boolean = false) {
    this.addModalActive = false;
    if (!this.onlyModal) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { action: null },
        queryParamsHandling: 'merge'
      });
    }
    this.closeModalEvent.emit(saved);
  }

  onChange($event: Event) {
    const file = ($event.target as HTMLInputElement);
    if (file.files != null && file.files.length > 0) {
      this.convertToBase64(file.files[0], (base64) => {
        this.categoryPicture = base64;
        this.categoryOriginalPicture = base64;
        this.toleranceThresholdAdd = 35;
      });
    }
  }

  onChangeEdit($event: Event) {
    const file = ($event.target as HTMLInputElement);
    if (file.files != null && file.files.length > 0) {
      this.convertToBase64(file.files[0], (base64) => {
        this.myimage = base64;
        this.originalImage = base64;
        this.toleranceThresholdEdit = 35;
      });
    }
  }

  convertToBase64(file: File, callback: (res: string) => void) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      callback(d);
    });
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

  clearImage() {
    this.categoryPicture = '';
    this.categoryOriginalPicture = '';
  }

  clearImageEdit() {
    this.myimage = '';
    this.originalImage = '';
  }

  removeBgAdd() {
    if (!this.categoryOriginalPicture) return;
    this.removeBgCanvas(this.categoryOriginalPicture, this.toleranceThresholdAdd, (result) => {
      this.categoryPicture = result;
    });
  }

  resetBgAdd() {
    if (this.categoryOriginalPicture) {
      this.categoryPicture = this.categoryOriginalPicture;
      this.toleranceThresholdAdd = 35;
    }
  }

  removeBgEdit() {
    if (!this.originalImage) return;
    this.removeBgCanvas(this.originalImage, this.toleranceThresholdEdit, (result) => {
      this.myimage = result;
    });
  }

  resetBgEdit() {
    if (this.originalImage) {
      this.myimage = this.originalImage;
      this.toleranceThresholdEdit = 35;
    }
  }

  removeBgCanvas(originalSrc: string, threshold: number, callback: (res: string) => void) {
    const img = new Image();
    img.src = originalSrc;
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
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
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
      callback(canvas.toDataURL('image/png'));
    };
  }

  selectColorAdd(color: string) {
    this.categoryBgColor = color;
  }

  selectColorEdit(color: string) {
    this.editCategoryBgColor = color;
  }

  toggleDropdown(catName: string, event: Event) {
    event.stopPropagation();
    if (this.activeDropdownCategory === catName) {
      this.activeDropdownCategory = null;
    } else {
      this.activeDropdownCategory = catName;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.activeDropdownCategory = null;
  }

  addCategory() {
    this.categoryFormSubmitted = true;
    if (!this.newCategoryName || this.newCategoryName.trim() === '') return;
    const name = this.newCategoryName.trim().toUpperCase();
    
    // replace '/' in base64 string for index.js compatibility
    const formattedPic = this.categoryPicture ? this.categoryPicture.replace(/\//g, 'kigmfhhh') : '';

    this.dash.addCategory(name, formattedPic, this.categoryBgColor).subscribe(() => {
      this.newCategoryName = '';
      this.categoryPicture = '';
      this.categoryOriginalPicture = '';
      this.categoryBgColor = '#fef3c7';
      this.categoryFormSubmitted = false;
      this.closeAddModal(true);
      if (!this.onlyModal) {
        this.loadData();
      }
    }, err => {
      console.error(err);
      alert(this.trans.t('ADD_CAT_ERROR'));
    });
  }

  openEditModal(cat: any) {
    this.editingCategory = JSON.parse(JSON.stringify(cat));
    var re = /kigmfhhh/gi;
    this.myimage = this.editingCategory.picture ? this.editingCategory.picture.replace(re, "/") : '';
    this.originalImage = this.myimage;
    this.editCategoryBgColor = this.editingCategory.bg_color || '#fef3c7';
    this.toleranceThresholdEdit = 35;
    this.editModalActive = true;
  }

  closeEditModal() {
    this.editModalActive = false;
    this.editingCategory = null;
    this.myimage = '';
    this.originalImage = '';
  }

  saveCategoryEdit() {
    if (!this.editingCategory) return;
    // replace '/' in base64 string for index.js compatibility
    const formattedPic = this.myimage ? this.myimage.replace(/\//g, 'kigmfhhh') : '';
    
    this.dash.updateCategory(this.editingCategory.name, formattedPic, this.editCategoryBgColor).subscribe(() => {
      this.closeEditModal();
      this.loadData();
    }, err => {
      console.error(err);
      alert(this.trans.t('UPDATE_CAT_ERROR') || 'Error updating category');
    });
  }

  deleteCategory(cat: string) {
    if (cat === 'MIEL' || cat === 'HUILE') {
      alert(this.trans.t('DEFAULT_CAT_DELETE_ERROR'));
      return;
    }
    const count = this.getProductCount(cat);
    if (count > 0) {
      alert(this.trans.t('CAT_HAS_PRODUCTS_ERROR'));
      return;
    }
    
    this.deletingCategory = cat;
    this.deleteModalActive = true;
  }

  closeDeleteModal() {
    this.deleteModalActive = false;
    this.deletingCategory = null;
  }

  executeDelete() {
    if (this.deletingCategory) {
      this.dash.deleteCategory(this.deletingCategory).subscribe(() => {
        this.closeDeleteModal();
        this.loadData();
      }, err => {
        console.error(err);
        alert(this.trans.t('DELETE_CAT_ERROR'));
      });
    }
  }
}
