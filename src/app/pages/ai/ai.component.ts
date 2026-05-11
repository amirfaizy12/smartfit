import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

// ── Types ────────────────────────────────────────────────────
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

// ── Validators ───────────────────────────────────────────────
function positiveNumber(control: AbstractControl) {
  const v = parseFloat(control.value);
  return isNaN(v) || v <= 0 ? { positiveNumber: true } : null;
}

@Component({
  selector: 'app-ai',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss',
})
export class AiComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // ── Active Tab ───────────────────────────────────────────
  activeTab: 'bmi' | 'calories' = 'bmi';

  // ── Loading ──────────────────────────────────────────────
  isLoadingBmi = false;
  isLoadingCal = false;

  // ── Results ──────────────────────────────────────────────
  bmiResult: BmiResult = { key: '', value: '', badge: '', badgeClass: '', type: '', desc: '' };
  caloriesResult: CaloriesResult = { value: '', intensity: '', workoutLabel: '', desc: '', perMin: '' };
  apiError = '';

  // ── BMI Form ─────────────────────────────────────────────
  bmiForm: FormGroup = this.fb.group({
    Sex: ['', Validators.required],
    Age: ['', [Validators.required, Validators.min(1), Validators.max(120), positiveNumber]],
    Height_cm: ['', [Validators.required, Validators.min(50), Validators.max(300), positiveNumber]],
    Weight_kg: ['', [Validators.required, Validators.min(10), Validators.max(500), positiveNumber]],
  });

  // ── Calories Form ────────────────────────────────────────
  calForm: FormGroup = this.fb.group({
    Gender: ['', Validators.required],
    Age: ['', [Validators.required, Validators.min(1), Validators.max(120), positiveNumber]],
    Weight_kg: ['', [Validators.required, Validators.min(10), Validators.max(500), positiveNumber]],
    Workout_Type: ['', Validators.required],
    Session_Duration_hours: ['', [Validators.required, Validators.min(0.1), Validators.max(24), positiveNumber]],
    Avg_BPM: ['', [Validators.required, Validators.min(40), Validators.max(220), positiveNumber]],
    Max_BPM: ['', [Validators.required, Validators.min(40), Validators.max(220), positiveNumber]],
    Workout_Frequency_days_week: ['', [Validators.required, Validators.min(1), Validators.max(7)]],
  });

  // ── Helpers ──────────────────────────────────────────────
  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(form: FormGroup, field: string): string {
    const c = form.get(field);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['min']) return `Minimum value is ${c.errors['min'].min}.`;
    if (c.errors['max']) return `Maximum value is ${c.errors['max'].max}.`;
    if (c.errors['positiveNumber']) return 'Must be a positive number.';
    return 'Invalid value.';
  }

  scrollToAnalyzer(): void {
    document.getElementById('ai-analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── BMI Analysis ─────────────────────────────────────────
  analyzeBmi(): void {
    if (this.bmiForm.invalid) {
      this.bmiForm.markAllAsTouched();
      return;
    }
    this.isLoadingBmi = true;
    this.apiError = '';

    const { Sex, Age, Height_cm, Weight_kg } = this.bmiForm.value;

    this.http
      .post<{ predicted_bmi: number }>(
        'https://web-production-9a7c5.up.railway.app/predict',
        { Sex, Age: +Age, Height_cm: +Height_cm, Weight_kg: +Weight_kg }
      )
      .pipe(finalize(() => (this.isLoadingBmi = false)))
      .subscribe({
        next: (res) => {
          this.setBmiResult(res.predicted_bmi);
          setTimeout(() => {
            document.querySelector('[data-result="bmi"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: () => {
          this.apiError = 'BMI API is currently unavailable. Please try again later.';
        },
      });
  }

  private setBmiResult(bmi: number): void {
    const val = bmi.toFixed(1);
    if (bmi < 18.5) {
      this.bmiResult = { key: 'ecto', value: val, badge: 'Underweight', badgeClass: 'bg-blue-50 text-blue-700', type: 'Ectomorph', desc: 'Lean frame, fast metabolism' };
    } else if (bmi < 25) {
      this.bmiResult = { key: 'meso', value: val, badge: 'Balanced', badgeClass: 'bg-green-50 text-green-700', type: 'Mesomorph', desc: 'Athletic, well-proportioned' };
    } else if (bmi < 30) {
      this.bmiResult = { key: 'over', value: val, badge: 'Overweight', badgeClass: 'bg-amber-50 text-amber-700', type: 'Endomorph', desc: 'Higher body fat tendency' };
    } else {
      this.bmiResult = { key: 'obese', value: val, badge: 'Obese', badgeClass: 'bg-red-50 text-red-700', type: 'Obese', desc: 'High health risk range' };
    }
  }

  // ── Calories Analysis ────────────────────────────────────
  analyzeCalories(): void {
    if (this.calForm.invalid) {
      this.calForm.markAllAsTouched();
      return;
    }
    if (!this.bmiResult.value) {
      this.apiError = 'Please run BMI Analysis first — it is required for calorie prediction.';
      return;
    }
    this.isLoadingCal = true;
    this.apiError = '';

    const v = this.calForm.value;
    const payload = {
      Age: +v.Age,
      Gender: v.Gender,
      Weight_kg: +v.Weight_kg,
      Workout_Type: v.Workout_Type,
      Session_Duration_hours: +v.Session_Duration_hours,
      Avg_BPM: +v.Avg_BPM,
      Max_BPM: +v.Max_BPM,
      Workout_Frequency_days_week: +v.Workout_Frequency_days_week,
      BMI: parseFloat(this.bmiResult.value),
    };

    this.http
      .post<{ predicted_burned_calories: number }>(
        'https://web-production-765ba.up.railway.app/predict',
        payload
      )
      .pipe(finalize(() => (this.isLoadingCal = false)))
      .subscribe({
        next: (res) => {
          this.setCaloriesResult(res.predicted_burned_calories, v);
          setTimeout(() => {
            document.querySelector('[data-result="calories"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        },
        error: () => {
          this.apiError = 'Calories API is currently unavailable. Please try again later.';
        },
      });
  }

  private readonly workoutMeta: Record<string, { label: string; intensity: string; desc: string }> = {
    Cardio:   { label: 'Cardio',    intensity: 'High',      desc: 'Aerobic endurance session' },
    HIIT:     { label: 'HIIT',      intensity: 'Very High', desc: 'High-intensity interval rounds' },
    Strength: { label: 'Strength',  intensity: 'Moderate',  desc: 'Resistance & hypertrophy focus' },
  };

  private setCaloriesResult(cal: number, v: any): void {
    const meta = this.workoutMeta[v.Workout_Type] ?? { label: v.Workout_Type, intensity: 'Moderate', desc: 'Workout session' };
    const durationMins = +v.Session_Duration_hours * 60;
    this.caloriesResult = {
      value: cal.toFixed(0),
      intensity: meta.intensity,
      workoutLabel: meta.label,
      desc: meta.desc,
      perMin: durationMins > 0 ? (cal / durationMins).toFixed(1) : '—',
    };
  }

  // ── Insight: shown only when both results are ready ──────
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
    } else if (bmi < 25) {
      return `Your ${type} profile is well-balanced. You burned ${cal} kcal in this ${workout} session — an ideal range for maintaining composition. Consistency is your highest leverage.`;
    } else if (bmi < 30) {
      return `With ${cal} kcal burned in your ${workout} session, you're making solid progress. Your ${type} tendencies mean diet adherence will be your biggest multiplier alongside regular sessions.`;
    } else {
      return `Every session counts — you burned ${cal} kcal today. Combining ${workout} with a structured nutrition plan will drive the most impact for your current composition goals.`;
    }
  }
}