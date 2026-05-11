import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {

  showDropdown = false;

  user = {
    name: 'Julian Dash',
    email: 'julian.dash@aurafit.com',
    memberSince: 'January 2024',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&auto=format',
    height: 185,
    weight: 82,
    objective: 'Hypertrophy & Muscle Gain',
    activityLevel: 'active',
  };

  objectives = [
    'Hypertrophy & Muscle Gain',
    'Fat Loss & Conditioning',
    'Strength & Power',
    'Endurance & Stamina',
    'General Fitness',
  ];
  /*
    const mapObjectiveToModel = (objective: string) => {
      switch(objective) {
        case 'Hypertrophy & Muscle Gain': return 'Weight Gain'
        case 'Fat Loss & Conditioning':   return 'Weight Loss'
        case 'Strength & Power':          return 'Weight Gain'
        case 'Endurance & Stamina':       return 'Weight Loss'
        case 'General Fitness':           return 'Weight Loss'
      }
    }
  */

  activityLevels = [
    { value: 'active', label: 'Active (4-5 days)', icon: 'fa-solid fa-person-running' },
    { value: 'high', label: 'High (6+ days)', icon: 'fa-solid fa-fire' },
    { value: 'moderate', label: 'Moderate (1-3 days)', icon: 'fa-solid fa-couch' },
  ];
  // const mapActivityToFrequency = (level: string): number => {
  //   switch(level) {
  //     case 'moderate': return 2   // 1-3 → نص
  //     case 'active':   return 4   // 4-5 → نص
  //     case 'high':     return 6   // 6+  → نص
  //   }
  // }
  constructor(private router: Router) { }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // ✅ أغلق الـ dropdown لو دوست برا
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showDropdown = false;
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.user = { ...this.user, avatar: reader.result as string };
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    console.log('Saved:', this.user);
    // API هنا
    this.router.navigate(['/profile']);
  }
}