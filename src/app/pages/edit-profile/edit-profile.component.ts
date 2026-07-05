import { Component, HostListener, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ProfileService } from '../../core/services/profile/profile.service';
import { UserProfileService } from '../../core/services/profile/user-profile.service';
import { FitnessGoal, FitnessType, LifestyleActivity, CompleteProfileRequest, CreateProfileRequest } from '../../core/models/api.models';
import { getApiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ── Signals from UserProfileService ──────────────────────────────────────
  readonly displayName = this.userProfileService.displayName;
  readonly avatarUrl   = this.userProfileService.avatarUrl;
  readonly profileData = this.userProfileService.profile;

  constructor() {
    // Reactively update form when profile loads
    effect(() => {
      const p = this.profileData();
      if (p) {
        let tokenEmail = '';
        try {
          const token = localStorage.getItem('smartfit_token');
          if (token) {
            const payload = JSON.parse(decodeURIComponent(atob(token.split('.')[1]).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')));
            tokenEmail = payload['email'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
          }
        } catch(e) {}

        this.user.name   = p.fullName  ?? '';
        this.user.email  = p.email || tokenEmail || '';
        this.user.height = p.height    ?? 0;
        this.user.weight = p.weight    ?? 0;
        this.user.age    = p.age       ?? 0;
        this.user.gender = (p.gender as 'Male' | 'Female') ?? 'Male';
        this.user.jobType = p.jobType ?? '';
        this.user.workingHoursPerDay = p.workingHoursPerDay ?? 0;
        this.user.workLocation = p.workLocation ?? '';
        this.user.monthlySalary = p.monthlySalary ?? 0;

        if (p.fitnessGoal)        this.fitnessForm.patchValue({ fitnessGoal:       p.fitnessGoal       });
        if (p.fitnessType)        this.fitnessForm.patchValue({ fitnessType:        p.fitnessType       });
        if (p.lifestyleActivity)  this.fitnessForm.patchValue({ lifestyleActivity:  p.lifestyleActivity });
        if (p.hasHypertension !== undefined) this.fitnessForm.patchValue({ hasHypertension: p.hasHypertension === "true" || p.hasHypertension === true as any });
        if (p.hasDiabetes     !== undefined) this.fitnessForm.patchValue({ hasDiabetes:     p.hasDiabetes === "true" || p.hasDiabetes === true as any });
        if (p.availableEquipment) this.fitnessForm.patchValue({ availableEquipment: p.availableEquipment });
      }
    });
  }

  // ── Static display data (mirrors profileData signal) ────────────────────
  showDropdown = false;

  /** True when arriving from the AI page due to "complete your profile" error */
  fromAi = false;

  // ── UI state ─────────────────────────────────────────────────────────────
  isSavingFitness = false;
  fitnessSaveSuccess = false;
  fitnessSaveError = '';

  // ── Fitness Profile form (the one the doctor requires) ───────────────────
  fitnessForm: FormGroup = this.fb.group({
    fitnessGoal:        ['LoseWeight', Validators.required],
    fitnessType:        ['Beginner',   Validators.required],
    lifestyleActivity:  ['Sedentary',  Validators.required],
    hasHypertension:    [false],
    hasDiabetes:        [false],
    availableEquipment: [''],
  });

  // ── Options for selects ───────────────────────────────────────────────────
  fitnessGoals: { value: FitnessGoal; label: string }[] = [
    { value: 'LoseWeight',      label: 'Lose Weight'       },
    { value: 'GainWeight',      label: 'Gain Weight'       },
    { value: 'BuildMuscle',     label: 'Build Muscle'      },
    { value: 'MaintainWeight',  label: 'Maintain Weight'   },
    { value: 'ImproveFitness',  label: 'Improve Fitness'   },
  ];

  fitnessTypes: { value: FitnessType; label: string }[] = [
    { value: 'Beginner',     label: 'Beginner'      },
    { value: 'Intermediate', label: 'Intermediate'  },
    { value: 'Advanced',     label: 'Advanced'      },
  ];

  lifestyleActivities: { value: LifestyleActivity; label: string }[] = [
    { value: 'Sedentary',        label: 'Sedentary (desk job, no exercise)'    },
    { value: 'LightlyActive',    label: 'Lightly Active (1–3 days/week)'       },
    { value: 'ModeratelyActive', label: 'Moderately Active (3–5 days/week)'    },
    { value: 'VeryActive',       label: 'Very Active (6–7 days/week)'          },
  ];

  // ── Old user object (kept for name/email/height/weight section) ──────────
  user = {
    name:          'User',
    email:         '',
    memberSince:   '',
    avatar:        '',
    height:        0,
    weight:        0,
    age:           0,
    gender:        'Male' as 'Male' | 'Female',
    jobType:       '',
    workingHoursPerDay: 0,
    workLocation:  '',
    monthlySalary: 0,
    objective:     'Hypertrophy & Muscle Gain',
    activityLevel: 'active',
  };

  objectives = [
    'Hypertrophy & Muscle Gain',
    'Fat Loss & Conditioning',
    'Strength & Power',
    'Endurance & Stamina',
    'General Fitness',
  ];

  activityLevels = [
    { value: 'active',   label: 'Active (4-5 days)',   icon: 'fa-solid fa-person-running' },
    { value: 'high',     label: 'High (6+ days)',       icon: 'fa-solid fa-fire'           },
    { value: 'moderate', label: 'Moderate (1-3 days)',  icon: 'fa-solid fa-couch'          },
  ];

  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Check if coming from the AI page
    this.fromAi = this.route.snapshot.queryParamMap.get('from') === 'ai';

    // Scroll into fitness section if coming from AI
    if (this.fromAi) {
      setTimeout(() => {
        document.getElementById('fitness-profile-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  /** Submit only the fitness/health fields to /api/Profile/complete-profile */
  saveFitnessProfile(): void {
    if (this.fitnessForm.invalid) {
      this.fitnessForm.markAllAsTouched();
      return;
    }

    this.isSavingFitness = true;
    this.fitnessSaveError   = '';
    this.fitnessSaveSuccess = false;

    const payload: CompleteProfileRequest = {
      fitnessGoal:        this.fitnessForm.value.fitnessGoal,
      fitnessType:        this.fitnessForm.value.fitnessType,
      lifestyleActivity:  this.fitnessForm.value.lifestyleActivity,
      hasHypertension:    !!this.fitnessForm.value.hasHypertension,
      hasDiabetes:        !!this.fitnessForm.value.hasDiabetes,
      availableEquipment: this.fitnessForm.value.availableEquipment ?? '',
    };

    this.profileService.completeProfile(payload)
      .pipe(finalize(() => (this.isSavingFitness = false)))
      .subscribe({
        next: () => {
          this.fitnessSaveSuccess = true;
          // Update the local signal so the profile page reflects changes
          this.userProfileService.patchProfile({
            fitnessGoal:       payload.fitnessGoal,
            fitnessType:       payload.fitnessType,
            lifestyleActivity: payload.lifestyleActivity,
            hasHypertension:   payload.hasHypertension ? "true" : "false",
            hasDiabetes:       payload.hasDiabetes ? "true" : "false",
            availableEquipment:payload.availableEquipment,
          });

          // If user came from AI, redirect back after a short delay
          if (this.fromAi) {
            setTimeout(() => this.router.navigate(['/ai']), 1500);
          }
        },
        error: (err) => {
          this.fitnessSaveError = getApiErrorMessage(err, 'Failed to save fitness profile. Please try again.');
        },
      });
  }

  // ── Dropdown + photo (unchanged) ─────────────────────────────────────────

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

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

  isSavingGeneral = false;
  generalSaveSuccess = false;
  generalSaveError = '';

  saveChanges() {
    this.isSavingGeneral = true;
    this.generalSaveError = '';
    this.generalSaveSuccess = false;

    // Use current fitness fields, or defaults if not valid yet, since CreateProfileRequest requires them.
    const fitnessGoal = this.fitnessForm.value.fitnessGoal || 'ImproveFitness';
    const fitnessType = this.fitnessForm.value.fitnessType || 'Beginner';
    const lifestyleActivity = this.fitnessForm.value.lifestyleActivity || 'ModeratelyActive';
    // Convert booleans to strings "true" / "false"
    const hasHypertension = this.fitnessForm.value.hasHypertension ? "true" : "false";
    const hasDiabetes = this.fitnessForm.value.hasDiabetes ? "true" : "false";
    const availableEquipment = this.fitnessForm.value.availableEquipment || '';

    const payload: CreateProfileRequest = {
      fullName: this.user.name,
      age: this.user.age,
      height: this.user.height,
      weight: this.user.weight,
      gender: this.user.gender,
      hasHypertension,
      hasDiabetes,
      fitnessGoal,
      fitnessType,
      availableEquipment,
      jobType: this.user.jobType,
      workingHoursPerDay: this.user.workingHoursPerDay,
      workLocation: this.user.workLocation,
      monthlySalary: this.user.monthlySalary,
      profilePictureUrl: this.user.avatar || 'string',
      lifestyleActivity
    };

    this.profileService.upsertProfile(payload)
      .pipe(finalize(() => (this.isSavingGeneral = false)))
      .subscribe({
        next: () => {
          this.generalSaveSuccess = true;
          this.userProfileService.loadProfile().subscribe();
          setTimeout(() => {
            if (this.fromAi) {
              this.router.navigate(['/ai']);
            } else {
              this.router.navigate(['/profile']);
            }
          }, 1500);
        },
        error: (err) => {
          this.generalSaveError = getApiErrorMessage(err, 'Failed to save profile changes.');
        }
      });
  }
}