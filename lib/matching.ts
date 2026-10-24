import { IUser } from '../models/User';

export interface CompatibilityResult {
  overallScore: number;
  sharedTraits: string[];
  differences: string[];
  categoryScores: {
    budget: number;
    lifestyle: number;
    schedule: number;
  };
}

export function calculateCompatibility(userA: Partial<IUser>, userB: Partial<IUser>): CompatibilityResult {
  const sharedTraits: string[] = [];
  const differences: string[] = [];

  // 1. Budget Compatibility (Weight: 30%)
  let budgetScore = 50;
  if (userA.budgetMin && userA.budgetMax && userB.budgetMin && userB.budgetMax) {
    const overlapMin = Math.max(userA.budgetMin, userB.budgetMin);
    const overlapMax = Math.min(userA.budgetMax, userB.budgetMax);

    if (overlapMin <= overlapMax) {
      budgetScore = 100;
      sharedTraits.push('Budget ranges align perfectly');
    } else {
      const gap = overlapMin - overlapMax;
      budgetScore = Math.max(10, Math.round(100 - gap / 150));
      differences.push('Budget mismatch');
    }
  }

  // 2. Schedule & Cleanliness (Weight: 35%)
  let scheduleScore = 0;
  const lifeA = userA.lifestyle;
  const lifeB = userB.lifestyle;

  if (lifeA && lifeB) {
    // Sleep Schedule
    if (lifeA.sleepSchedule === lifeB.sleepSchedule) {
      scheduleScore += 50;
      sharedTraits.push(`Both are ${lifeA.sleepSchedule.replace('_', ' ')}s`);
    } else if (lifeA.sleepSchedule === 'flexible' || lifeB.sleepSchedule === 'flexible') {
      scheduleScore += 35;
    } else {
      differences.push('Opposite sleep timings (Early Bird vs Night Owl)');
    }

    // Cleanliness
    if (lifeA.cleanliness === lifeB.cleanliness) {
      scheduleScore += 50;
      sharedTraits.push(`Both prefer ${lifeA.cleanliness} cleanliness`);
    } else if (
      (lifeA.cleanliness === 'moderate' && lifeB.cleanliness === 'spotless') ||
      (lifeA.cleanliness === 'relaxed' && lifeB.cleanliness === 'moderate')
    ) {
      scheduleScore += 30;
    } else {
      differences.push('Noticeable difference in cleanliness expectations');
    }
  }

  // 3. Lifestyle & Habits (Weight: 35%)
  let lifestyleScore = 0;
  if (lifeA && lifeB) {
    // Smoking
    if (lifeA.smoking === lifeB.smoking) {
      lifestyleScore += 35;
      sharedTraits.push(lifeA.smoking === 'non_smoker' ? 'Both non-smokers' : 'Matching smoking preferences');
    } else if (lifeA.smoking === 'non_smoker' || lifeB.smoking === 'non_smoker') {
      differences.push('Conflicting smoking habits');
    } else {
      lifestyleScore += 20;
    }

    // Diet
    if (lifeA.diet === lifeB.diet) {
      lifestyleScore += 35;
      sharedTraits.push(`Both follow a ${lifeA.diet.replace('_', '-')} diet`);
    } else if (lifeA.diet === 'no_preference' || lifeB.diet === 'no_preference') {
      lifestyleScore += 30;
    }

    // Social / Guests
    if (lifeA.socialHabits === lifeB.socialHabits) {
      lifestyleScore += 30;
      sharedTraits.push(`Compatible social vibe (${lifeA.socialHabits})`);
    } else {
      lifestyleScore += 15;
    }
  }

  const overallScore = Math.min(
    99,
    Math.max(25, Math.round(budgetScore * 0.3 + scheduleScore * 0.35 + lifestyleScore * 0.35))
  );

  return {
    overallScore,
    sharedTraits,
    differences,
    categoryScores: {
      budget: budgetScore,
      lifestyle: Math.min(100, lifestyleScore),
      schedule: Math.min(100, scheduleScore),
    },
  };
}
