// ── Admin API Response Models ──────────────────────────────────────────

/** GET /api/Admin/dashboard/statistics */
export interface AdminDashboardStats {
  totalUsers?: number;
  totalWorkouts?: number;
  totalBMIAnalyses?: number;
  totalCaloriesPredictions?: number;
  totalDietRecommendations?: number;
  totalExerciseRecommendations?: number;
  // catch-all for unknown fields from the API
  [key: string]: any;
}

/** GET /api/Admin/users — single user item */
export interface AdminUserDto {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  isDisabled?: boolean;
  isActive?: boolean;
  createdAt?: string;
  registeredAt?: string;
  profilePictureUrl?: string;
  role?: string;
  // catch-all
  [key: string]: any;
}

/** GET /api/Admin/logs/bmi — single BMI log */
export interface AdminBmiLog {
  id?: string;
  userId?: string;
  userName?: string;
  bmi?: number;
  bodyType?: string;
  healthStatus?: string;
  createdAt?: string;
  [key: string]: any;
}

/** GET /api/Admin/logs/calories — single Calories log */
export interface AdminCaloriesLog {
  id?: string;
  userId?: string;
  userName?: string;
  calories?: number;
  workoutType?: string;
  createdAt?: string;
  [key: string]: any;
}

/** GET /api/Admin/logs/diets — single Diet log */
export interface AdminDietLog {
  id?: string;
  userId?: string;
  userName?: string;
  recommendation?: string;
  createdAt?: string;
  [key: string]: any;
}

/** GET /api/Admin/logs/exercises — single Exercise log */
export interface AdminExerciseLog {
  id?: string;
  userId?: string;
  userName?: string;
  recommendation?: string;
  createdAt?: string;
  [key: string]: any;
}
