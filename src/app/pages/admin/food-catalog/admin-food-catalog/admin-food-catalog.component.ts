import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodCatalogService } from '../../../../core/services/food-catalog/food-catalog.service';

@Component({
  selector: 'app-admin-food-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-food-catalog.component.html',
})
export class AdminFoodCatalogComponent implements OnInit {
  private readonly foodService = inject(FoodCatalogService);

  foods: any[] = [];
  categories: any[] = [];
  isLoading = false;
  
  // Search
  searchTerm = '';
  filterCategory = '';
  
  // Modal state
  isModalOpen = false;
  isEditMode = false;
  currentFood: any = {};

  ngOnInit(): void {
    this.loadFoods();
    this.loadCategories();
  }

  loadFoods(): void {
    this.isLoading = true;
    
    // The API search allows search string. 
    // If we have a category filter, we can use getFoodByCategory, else search.
    const apiCall$ = this.filterCategory 
      ? this.foodService.getFoodByCategory(this.filterCategory)
      : this.foodService.searchFood(this.searchTerm);

    apiCall$.subscribe({
      next: (res) => {
        this.foods = res?.data || res?.Data || res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load foods', err);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.foodService.getCategories().subscribe({
      next: (res) => this.categories = res?.data || res?.Data || res || []
    });
  }

  onSearch(): void {
    // If they typed something but had a category selected, let's just use the search endpoint,
    // or they have to clear the category to search effectively based on API structure.
    if (this.searchTerm && this.filterCategory) {
      this.filterCategory = ''; // clear category if typing search
    }
    this.loadFoods();
  }

  onCategoryChange(): void {
    if (this.filterCategory) {
      this.searchTerm = ''; // clear search if picking category
    }
    this.loadFoods();
  }

  openModal(food?: any): void {
    if (food) {
      this.isEditMode = true;
      this.currentFood = { ...food };
    } else {
      this.isEditMode = false;
      this.currentFood = {
        name: '',
        category: 0, // usually an enum int
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        servingSize: '100g'
      };
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentFood = {};
  }

  saveFood(): void {
    // The swagger for food put/post has no ID in URL, it sends object directly
    const apiCall$ = this.isEditMode
      ? this.foodService.updateFood(this.currentFood)
      : this.foodService.createFood(this.currentFood);

    apiCall$.subscribe({
      next: () => {
        this.closeModal();
        this.loadFoods();
      },
      error: (err) => {
        console.error('Save failed', err);
        alert('Failed to save food item.');
      }
    });
  }

  deleteFood(id: string): void {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    
    this.foodService.deleteFood(id).subscribe({
      next: () => this.loadFoods(),
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete food item.');
      }
    });
  }
}
