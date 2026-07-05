export interface WeightProgressDto {
  date: string;
  weight: number;
}

export interface DashboardStatisticsDto {
  totalMeals: number;
  totalWorkouts: number;
  totalBMIAnalyses: number;
  totalExerciseRecommendations: number;
  totalDietRecommendations: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
}

export interface HealthRecommendationDto {
  id: number;
  userId: string;
  recommendationType: string;
  recommendationText: string;
  dateGenerated: string;
}

export interface LifestyleSummaryDto {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  waterTasks: number;
  sleepTasks: number;
  workoutTasks: number;
  walkingTasks: number;
  readingTasks: number;
}

export interface WaterTrackingDto {
  dailyGoalMl: number;
  consumedMl: number;
  remainingMl: number;
  completionPercentage: number;
}

export interface WorkoutSummaryDto {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalDurationMinutes: number;
}

export interface DashboardDto {
  fullName?: string;
  currentWeight?: number;
  currentBMI?: number;
  bodyType?: string;
  healthStatus?: string;
  latestPredictedCalories?: number;
  workoutAnalysis?: string;
  workoutSummaryText?: string;
  latestExerciseRecommendation?: string | null;
  latestDietRecommendation?: string | null;
  waterTracking?: WaterTrackingDto;
  workoutSummary?: WorkoutSummaryDto;
  statistics?: DashboardStatisticsDto;
  latestHealthRecommendation?: HealthRecommendationDto | null;
  lifestyleSummary?: LifestyleSummaryDto;
  weightProgress?: WeightProgressDto[];
}
