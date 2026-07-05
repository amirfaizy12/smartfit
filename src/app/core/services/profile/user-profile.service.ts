import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  fullName: string;
  email?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  profilePictureUrl?: string;
  fitnessGoal?: string;
  fitnessType?: string;
  lifestyleActivity?: string;
  hasHypertension?: string;
  hasDiabetes?: string;
  availableEquipment?: string;
  jobType?: string;
  workingHoursPerDay?: number;
  workLocation?: string;
  monthlySalary?: number;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=4f46e5&color=fff&size=200&bold=true&name=User';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Profile`;

  /** Signal holding the current user's profile — null means not loaded yet */
  private readonly _profile = signal<UserProfile | null>(null);

  /** Public read-only signal */
  readonly profile = this._profile.asReadonly();

  /** Computed display name — falls back to 'User' */
  readonly displayName = computed(() => this._profile()?.fullName ?? 'User');

  /** Computed avatar URL — falls back to a generated initials avatar */
  readonly avatarUrl = computed(() => {
    const p = this._profile();
    if (p?.profilePictureUrl && p.profilePictureUrl !== 'string' && p.profilePictureUrl.startsWith('http')) return p.profilePictureUrl;
    const name = encodeURIComponent(p?.fullName ?? 'U');
    return `https://ui-avatars.com/api/?background=4f46e5&color=fff&size=200&bold=true&name=${name}`;
  });

  /**
   * Fetch the profile from the API and store it in the signal.
   * Silently ignores 404 (profile not created yet).
   */
  loadProfile(): Observable<unknown> {
    return this.http.get<unknown>(this.baseUrl).pipe(
      tap((raw) => {
        const data = this.extractData(raw);
        if (data) {
          this._profile.set(data as UserProfile);
        }
      }),
      catchError(() => of(null))
    );
  }

  /** Update specific fields on the stored profile without re-fetching */
  patchProfile(partial: Partial<UserProfile>): void {
    const current = this._profile();
    this._profile.set(current ? { ...current, ...partial } : (partial as UserProfile));
  }

  /** Clear the stored profile (on logout) */
  clearProfile(): void {
    this._profile.set(null);
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  private extractData(raw: unknown): UserProfile | null {
    if (!raw || typeof raw !== 'object') return null;

    const obj = raw as Record<string, unknown>;

    // API may wrap in { data: ... } or { Data: ... }
    const inner = (obj['data'] ?? obj['Data'] ?? obj) as Record<string, unknown>;

    if (!inner || typeof inner !== 'object') return null;

    return {
      fullName:           (inner['fullName']           ?? inner['FullName']           ?? '') as string,
      email:              (inner['email']               ?? inner['Email']               ?? undefined) as string | undefined,
      age:                (inner['age']                 ?? inner['Age']                 ?? undefined) as number | undefined,
      height:             (inner['height']              ?? inner['Height']              ?? undefined) as number | undefined,
      weight:             (inner['weight']              ?? inner['Weight']              ?? undefined) as number | undefined,
      gender:             (inner['gender']              ?? inner['Gender']              ?? undefined) as string | undefined,
      profilePictureUrl:  (inner['profilePictureUrl']   ?? inner['ProfilePictureUrl']   ?? undefined) as string | undefined,
      fitnessGoal:        (inner['fitnessGoal']         ?? inner['FitnessGoal']         ?? undefined) as string | undefined,
      fitnessType:        (inner['fitnessType']         ?? inner['FitnessType']         ?? undefined) as string | undefined,
      lifestyleActivity:  (inner['lifestyleActivity']   ?? inner['LifestyleActivity']   ?? undefined) as string | undefined,
      hasHypertension:    (inner['hasHypertension']     ?? inner['HasHypertension']     ?? "false")   as string,
      hasDiabetes:        (inner['hasDiabetes']         ?? inner['HasDiabetes']         ?? "false")   as string,
      availableEquipment: (inner['availableEquipment']  ?? inner['AvailableEquipment']  ?? '')        as string,
      jobType:            (inner['jobType']             ?? inner['JobType']             ?? '')        as string,
      workingHoursPerDay: (inner['workingHoursPerDay']  ?? inner['WorkingHoursPerDay']  ?? 0)         as number,
      workLocation:       (inner['workLocation']        ?? inner['WorkLocation']        ?? '')        as string,
      monthlySalary:      (inner['monthlySalary']       ?? inner['MonthlySalary']       ?? 0)         as number,
    };
  }
}
