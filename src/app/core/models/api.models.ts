export type Gender = 'Male' | 'Female';

export type FitnessGoal =
  | 'LoseWeight'
  | 'GainWeight'
  | 'BuildMuscle'
  | 'MaintainWeight'
  | 'ImproveFitness';

export type FitnessType = 'Beginner' | 'Intermediate' | 'Advanced';

export type LifestyleActivity =
  | 'Sedentary'
  | 'LightlyActive'
  | 'ModeratelyActive'
  | 'VeryActive';

export type WorkoutType = 'Cardio' | 'Strength' | 'HIIT' | 'Yoga' | 'Walking';

export interface ApiResponse<T = unknown> {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  data?: T;
  Data?: T;
  errors?: string[];
  Errors?: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetLink: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface CreateProfileRequest {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  fitnessGoal: FitnessGoal;
  fitnessType?: FitnessType;
  lifestyleActivity?: LifestyleActivity;
}

export interface CaloriesPredictionRequest {
  workoutType: WorkoutType;
  sessionDurationHours: number;
  workoutFrequencyDaysWeek: number;
}

export interface BmiAnalysisResult {
  bmi: number;
  bodyType?: string;
  healthStatus?: string;
}

export interface CaloriesAnalysisResult {
  calories: number;
  workoutType: WorkoutType;
  sessionDurationHours: number;
  workoutFrequencyDaysWeek: number;
}
