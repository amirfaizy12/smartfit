import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExercisesService } from '../../../../core/services/exercises/exercises.service';

@Component({
  selector: 'app-admin-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-exercises.component.html',
})
export class AdminExercisesComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);

  exercises: any[] = [];
  categories: any[] = [];
  isLoading = false;
  
  // Pagination / Search
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  
  // Modal state
  isModalOpen = false;
  isEditMode = false;
  currentExercise: any = {};

  // Filters
  filterGoal = '';
  filterLevel = '';

  ngOnInit(): void {
    this.loadExercises();
    this.loadCategories();
  }

  loadExercises(): void {
    this.isLoading = true;
    this.exercisesService.getExercises(this.searchTerm, this.filterGoal, undefined, this.filterLevel, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.exercises = res?.data || res?.Data || res || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load exercises', err);
          this.isLoading = false;
        }
      });
  }

  loadCategories(): void {
    this.exercisesService.getCategories().subscribe({
      next: (res) => this.categories = res?.data || res?.Data || res || []
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadExercises();
  }

  openModal(exercise?: any): void {
    if (exercise) {
      this.isEditMode = true;
      // Copy object
      this.currentExercise = { ...exercise };
    } else {
      this.isEditMode = false;
      this.currentExercise = {
        name: '',
        description: '',
        targetMuscle: '',
        level: '',
        fitnessGoal: '',
        fitnessType: '',
        supportsHypertension: false,
        supportsDiabetes: false,
        equipment: '',
        estimatedCaloriesBurn: 0,
        durationInMinutes: 0,
        imageUrl: '',
        gifUrl: '',
        categoryId: '' // Needs a valid UUID if required
      };
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentExercise = {};
  }

  saveExercise(): void {
    const apiCall$ = this.isEditMode
      ? this.exercisesService.updateExercise(this.currentExercise.id || this.currentExercise.Id, this.currentExercise)
      : this.exercisesService.createExercise(this.currentExercise);

    apiCall$.subscribe({
      next: () => {
        this.closeModal();
        this.loadExercises();
      },
      error: (err) => {
        console.error('Save failed', err);
        alert('Failed to save exercise.');
      }
    });
  }

  toggleActiveStatus(exercise: any): void {
    const id = exercise.id || exercise.Id;
    const isActive = exercise.isActive ?? exercise.IsActive ?? true; // Default to true if missing

    const apiCall$ = isActive 
      ? this.exercisesService.deactivateExercise(id)
      : this.exercisesService.activateExercise(id);

    apiCall$.subscribe({
      next: () => {
        exercise.isActive = !isActive;
        exercise.IsActive = !isActive;
      },
      error: (err) => {
        console.error('Toggle failed', err);
        alert('Failed to change status.');
      }
    });
  }

  deleteExercise(id: string): void {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    this.exercisesService.deleteExercise(id).subscribe({
      next: () => this.loadExercises(),
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete exercise.');
      }
    });
  }
}
