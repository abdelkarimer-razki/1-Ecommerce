import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: string[] = [];
  allProducts: any[] = [];
  loading: boolean = true;
  
  // Create category form
  newCategoryName: string = '';
  categoryFormSubmitted: boolean = false;

  // Delete category confirmation modal states
  deleteModalActive: boolean = false;
  deletingCategory: string | null = null;

  constructor(
    private dash: DashboardService,
    private titleService: Title,
    public trans: TranslationService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('CATEGORIES_SECTION'));
    this.loadData();
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

  addCategory() {
    this.categoryFormSubmitted = true;
    if (!this.newCategoryName || this.newCategoryName.trim() === '') return;
    const name = this.newCategoryName.trim().toUpperCase();
    this.dash.addCategory(name).subscribe(() => {
      this.newCategoryName = '';
      this.categoryFormSubmitted = false;
      this.loadData();
    }, err => {
      console.error(err);
      alert(this.trans.t('ADD_CAT_ERROR'));
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
