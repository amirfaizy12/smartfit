import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { BmiService } from '../../core/services/ai/bmi.service';
import { CaloriesService } from '../../core/services/ai/calories.service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { UserProfileService } from '../../core/services/profile/user-profile.service';
import {
  CreateProfileRequest,
  Gender,
  WorkoutType,
} from '../../core/models/api.models';
import { getApiErrorMessage } from '../../core/utils/api-error.util';

interface BmiResult {
  key: 'ecto' | 'meso' | 'over' | 'obese' | '';
  value: string;
  badge: string;
  badgeClass: string;
  type: string;
  desc: string;
}

interface CaloriesResult {
  value: string;
  intensity: string;
  workoutLabel: string;
  desc: string;
  perMin: string;
}

function positiveNumber(control: AbstractControl) {
  const value = parseFloat(control.value);
  return Number.isNaN(value) || value <= 0 ? { positiveNumber: true } : null;
}

@Component({
  selector: 'app-ai',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss',
})
export class AiComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly bmiService = inject(BmiService);
  private readonly caloriesService = inject(CaloriesService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;

  activeTab: 'bmi' | 'calories' = 'bmi';
  isLoadingBmi = false;
  isLoadingCal = false;
  showProfileRedirect = false;

  bmiResult: BmiResult = {
    key: '',
    value: '',
    badge: '',
    badgeClass: '',
    type: '',
    desc: '',
  };

  caloriesResult: CaloriesResult = {
    value: '',
    intensity: '',
    workoutLabel: '',
    desc: '',
    perMin: '',
  };

  apiError = '';

  bmiForm: FormGroup = this.fb.group({
    Sex: ['', Validators.required],
    Age: ['', [Validators.required, Validators.min(1), Validators.max(120), positiveNumber]],
    Height_cm: ['', [Validators.required, Validators.min(50), Validators.max(300), positiveNumber]],
    Weight_kg: ['', [Validators.required, Validators.min(10), Validators.max(500), positiveNumber]],
  });

  calForm: FormGroup = this.fb.group({
    Workout_Type: ['', Validators.required],
    Session_Duration_hours: [
      '',
      [Validators.required, Validators.min(0.1), Validators.max(24), positiveNumber],
    ],
    Workout_Frequency_days_week: ['', [Validators.required, Validators.min(1), Validators.max(7)]],
  });

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      return `Maximum value is ${control.errors['max'].max}.`;
    }

    if (control.errors['positiveNumber']) {
      return 'Must be a positive number.';
    }

    return 'Invalid value.';
  }

  scrollToAnalyzer(): void {
    document.getElementById('ai-analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  analyzeBmi(): void {
    if (!this.isAuthenticated()) {
      this.apiError = 'Please log in to run BMI analysis.';
      return;
    }

    if (this.bmiForm.invalid) {
      this.bmiForm.markAllAsTouched();
      return;
    }

    this.isLoadingBmi = true;
    this.apiError = '';
    this.showProfileRedirect = false;

    const { Sex, Age, Height_cm, Weight_kg } = this.bmiForm.value;
    const currentProfile = this.userProfileService.profile();

    const needsUpdate =
      !currentProfile ||
      currentProfile.age !== +Age ||
      currentProfile.height !== +Height_cm ||
      currentProfile.weight !== +Weight_kg ||
      currentProfile.gender !== Sex;

    const predictCall = this.bmiService.predict();

    let bmiObservable = predictCall;

    if (needsUpdate) {
      const profilePayload: CreateProfileRequest = {
        fullName: currentProfile?.fullName || 'User',
        age: +Age,
        height: +Height_cm,
        weight: +Weight_kg,
        gender: Sex as Gender,
        hasHypertension: currentProfile?.hasHypertension || "false",
        hasDiabetes: currentProfile?.hasDiabetes || "false",
        fitnessGoal: (currentProfile?.fitnessGoal as any) || 'ImproveFitness',
        fitnessType: (currentProfile?.fitnessType as any) || 'Beginner',
        lifestyleActivity: (currentProfile?.lifestyleActivity as any) || 'ModeratelyActive',
        availableEquipment: currentProfile?.availableEquipment || 'none',
        jobType: currentProfile?.jobType || 'None',
        workingHoursPerDay: currentProfile?.workingHoursPerDay || 0,
        workLocation: currentProfile?.workLocation || 'None',
        monthlySalary: currentProfile?.monthlySalary || 0,
        profilePictureUrl: currentProfile?.profilePictureUrl || 'string'
      };

      this.userProfileService.patchProfile({
        age: +Age,
        height: +Height_cm,
        weight: +Weight_kg,
        gender: Sex
      });

      bmiObservable = this.profileService.upsertProfile(profilePayload).pipe(
        switchMap(() => predictCall)
      );
    }

    bmiObservable
      .pipe(finalize(() => (this.isLoadingBmi = false)))
      .subscribe({
        next: (result) => {
          this.setBmiResult(result.bmi, result.bodyType, result.healthStatus);
          setTimeout(() => {
            document
              .querySelector('[data-result="bmi"]')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          const msg = getApiErrorMessage(
            error,
            'BMI analysis failed. Please complete your profile and try again.'
          );
          this.apiError = msg;
          // If the server says profile is incomplete or missing → show the manual redirect button
          if (
            msg.toLowerCase().includes('complete your profile') ||
            msg.toLowerCase().includes('bmi analysis failed') ||
            msg.toLowerCase().includes('profile not found')
          ) {
            this.showProfileRedirect = true;
          }
        },
      });
  }

  analyzeCalories(): void {
    if (!this.isAuthenticated()) {
      this.apiError = 'Please log in to predict calories.';
      return;
    }

    if (this.calForm.invalid) {
      this.calForm.markAllAsTouched();
      return;
    }




    this.isLoadingCal = true;
    this.apiError = '';

    const formValue = this.calForm.value;
    const payload = {
      workoutType: formValue.Workout_Type as WorkoutType,
      sessionDurationHours: +formValue.Session_Duration_hours,
      workoutFrequencyDaysWeek: +formValue.Workout_Frequency_days_week,
    };

    this.caloriesService
      .predict(payload)
      .pipe(finalize(() => (this.isLoadingCal = false)))
      .subscribe({
        next: (result) => {
          this.setCaloriesResult(result.calories, payload);
          setTimeout(() => {
            document
              .querySelector('[data-result="calories"]')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          this.apiError = getApiErrorMessage(
            error,
            'Calories prediction failed. Please try again.'
          );
        },
      });
  }

  private setBmiResult(bmi: number, bodyType?: string, healthStatus?: string): void {
    const value = bmi.toFixed(1);

    if (bodyType) {
      this.bmiResult = {
        key: 'meso',
        value,
        badge: healthStatus ?? 'Analyzed',
        badgeClass: 'bg-green-50 text-green-700',
        type: bodyType,
        desc: healthStatus ?? 'AI body type classification',
      };
      return;
    }

    if (bmi < 18.5) {
      this.bmiResult = {
        key: 'ecto',
        value,
        badge: 'Underweight',
        badgeClass: 'bg-blue-50 text-blue-700',
        type: 'Ectomorph',
        desc: 'Lean frame, fast metabolism',
      };
    } else if (bmi < 25) {
      this.bmiResult = {
        key: 'meso',
        value,
        badge: 'Balanced',
        badgeClass: 'bg-green-50 text-green-700',
        type: 'Mesomorph',
        desc: 'Athletic, well-proportioned',
      };
    } else if (bmi < 30) {
      this.bmiResult = {
        key: 'over',
        value,
        badge: 'Overweight',
        badgeClass: 'bg-amber-50 text-amber-700',
        type: 'Endomorph',
        desc: 'Higher body fat tendency',
      };
    } else {
      this.bmiResult = {
        key: 'obese',
        value,
        badge: 'Obese',
        badgeClass: 'bg-red-50 text-red-700',
        type: 'Obese',
        desc: 'High health risk range',
      };
    }
  }

  private readonly workoutMeta: Record<string, { label: string; intensity: string; desc: string }> = {
    Cardio: { label: 'Cardio', intensity: 'High', desc: 'Aerobic endurance session' },
    HIIT: { label: 'HIIT', intensity: 'Very High', desc: 'High-intensity interval rounds' },
    Strength: { label: 'Strength', intensity: 'Moderate', desc: 'Resistance and hypertrophy focus' },
    Yoga: { label: 'Yoga', intensity: 'Low', desc: 'Mobility and recovery focused session' },
    Walking: { label: 'Walking', intensity: 'Low', desc: 'Steady-state cardio session' },
  };

  private setCaloriesResult(
    calories: number,
    payload: {
      workoutType: WorkoutType;
      sessionDurationHours: number;
      workoutFrequencyDaysWeek: number;
    }
  ): void {
    const meta = this.workoutMeta[payload.workoutType] ?? {
      label: payload.workoutType,
      intensity: 'Moderate',
      desc: 'Workout session',
    };

    const durationMins = payload.sessionDurationHours * 60;

    this.caloriesResult = {
      value: calories.toFixed(0),
      intensity: meta.intensity,
      workoutLabel: meta.label,
      desc: meta.desc,
      perMin: durationMins > 0 ? (calories / durationMins).toFixed(1) : '—',
    };
  }

  get showInsight(): boolean {
    return !!this.bmiResult.value && !!this.caloriesResult.value;
  }

  get insightText(): string {
    const bmi = parseFloat(this.bmiResult.value);
    const cal = parseFloat(this.caloriesResult.value);
    const type = this.bmiResult.type;
    const workout = this.caloriesResult.workoutLabel;

    if (bmi < 18.5) {
      return `As an ${type}, your lean frame burns calories efficiently. You burned ${cal} kcal — consider pairing ${workout} with a caloric surplus and progressive strength training to build lean mass.`;
    }

    if (bmi < 25) {
      return `Your ${type} profile is well-balanced. You burned ${cal} kcal in this ${workout} session — an ideal range for maintaining composition. Consistency is your highest leverage.`;
    }

    if (bmi < 30) {
      return `With ${cal} kcal burned in your ${workout} session, you're making solid progress. Your ${type} tendencies mean diet adherence will be your biggest multiplier alongside regular sessions.`;
    }

    return `Every session counts — you burned ${cal} kcal today. Combining ${workout} with a structured nutrition plan will drive the most impact for your current composition goals.`;
  }
}
