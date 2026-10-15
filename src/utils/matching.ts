import { UserProfile, CompatibilityBreakdown } from '../types';

export function calculateCompatibility(userA: UserProfile, userB: UserProfile): CompatibilityBreakdown {
  if (userA.id === userB.id) {
    return {
      overallScore: 100,
      sharedTraits: ['Self profile'],
      differences: [],
      categoryScores: { budget: 100, location: 100, lifestyle: 100, schedule: 100, habits: 100 }
    };
  }

  const sharedTraits: string[] = [];
  const differences: string[] = [];

  // 1. Budget Compatibility (max 20)
  let budgetScore = 0;
  const overlapMin = Math.max(userA.budgetMin, userB.budgetMin);
  const overlapMax = Math.min(userA.budgetMax, userB.budgetMax);

  if (overlapMin <= overlapMax) {
    budgetScore = 100;
    sharedTraits.push(`Budget overlap (₹${overlapMin.toLocaleString()} - ₹${overlapMax.toLocaleString()})`);
  } else {
    const diff = overlapMin - overlapMax;
    if (diff <= 3000) {
      budgetScore = 70;
      differences.push(`Slight budget gap (approx ₹${diff.toLocaleString()} difference)`);
    } else if (diff <= 7000) {
      budgetScore = 40;
      differences.push(`Moderate budget variance (₹${diff.toLocaleString()})`);
    } else {
      budgetScore = 15;
      differences.push(`Significant budget difference (over ₹${diff.toLocaleString()})`);
    }
  }

  // 2. Location Compatibility (max 20)
  let locationScore = 0;
  const sameCity = userA.city.toLowerCase() === userB.city.toLowerCase();
  if (sameCity) {
    const commonLocalities = userA.preferredLocalities.filter(locA =>
      userB.preferredLocalities.some(locB => locB.toLowerCase() === locA.toLowerCase())
    );
    if (commonLocalities.length > 0) {
      locationScore = 100;
      sharedTraits.push(`Same target area: ${commonLocalities.join(', ')}`);
    } else {
      locationScore = 70;
      sharedTraits.push(`Both looking in ${userA.city}`);
      differences.push(`Different preferred localities in ${userA.city}`);
    }
  } else {
    locationScore = 20;
    differences.push(`Different cities: ${userA.city} vs ${userB.city}`);
  }

  // 3. Gender Preference Check (Dealbreaker / max 15)
  let genderScore = 100;
  let genderMismatch = false;

  const checkGender = (seeker: UserProfile, candidate: UserProfile) => {
    if (seeker.preferredRoommateGender === 'female_only' && candidate.gender !== 'female') return false;
    if (seeker.preferredRoommateGender === 'male_only' && candidate.gender !== 'male') return false;
    if (seeker.preferredRoommateGender === 'same_gender' && candidate.gender !== seeker.gender) return false;
    return true;
  };

  if (!checkGender(userA, userB) || !checkGender(userB, userA)) {
    genderMismatch = true;
    genderScore = 10;
    differences.push(`Gender preference criteria not mutually aligned`);
  } else {
    sharedTraits.push('Mutually compatible gender preferences');
  }

  // 4. Habits: Smoking & Drinking (max 15)
  let habitsScore = 100;
  if (userA.lifestyle.smoking === userB.lifestyle.smoking) {
    habitsScore += 10;
    if (userA.lifestyle.smoking === 'non_smoker') {
      sharedTraits.push('Both non-smokers (Clean air home)');
    } else {
      sharedTraits.push(`Both comfortable with smoking habits (${userA.lifestyle.smoking})`);
    }
  } else if (
    (userA.lifestyle.smoking === 'non_smoker' && userB.lifestyle.smoking === 'regular') ||
    (userB.lifestyle.smoking === 'non_smoker' && userA.lifestyle.smoking === 'regular')
  ) {
    habitsScore -= 35;
    differences.push('Opposite smoking preferences (Non-smoker vs Regular)');
  } else {
    habitsScore -= 10;
  }

  // Drinking
  if (userA.lifestyle.drinking === userB.lifestyle.drinking) {
    if (userA.lifestyle.drinking === 'non_drinker') {
      sharedTraits.push('Both non-drinkers');
    } else if (userA.lifestyle.drinking === 'social') {
      sharedTraits.push('Both occasional/social drinkers');
    }
  } else if (
    (userA.lifestyle.drinking === 'non_drinker' && userB.lifestyle.drinking === 'regular') ||
    (userB.lifestyle.drinking === 'non_drinker' && userA.lifestyle.drinking === 'regular')
  ) {
    habitsScore -= 20;
    differences.push('Drinking preference divergence');
  }

  habitsScore = Math.max(10, Math.min(100, habitsScore));

  // 5. Schedule & Sleep Timing (max 15)
  let scheduleScore = 0;
  if (userA.lifestyle.sleepSchedule === userB.lifestyle.sleepSchedule) {
    scheduleScore = 100;
    if (userA.lifestyle.sleepSchedule === 'early_bird') {
      sharedTraits.push('Both early risers with morning schedules');
    } else if (userA.lifestyle.sleepSchedule === 'night_owl') {
      sharedTraits.push('Both night owls / late-night friendly');
    } else {
      sharedTraits.push('Both have flexible sleep cycles');
    }
  } else if (
    (userA.lifestyle.sleepSchedule === 'early_bird' && userB.lifestyle.sleepSchedule === 'night_owl') ||
    (userA.lifestyle.sleepSchedule === 'night_owl' && userB.lifestyle.sleepSchedule === 'early_bird')
  ) {
    scheduleScore = 40;
    differences.push(`Schedule difference: ${formatSleep(userA.lifestyle.sleepSchedule)} vs ${formatSleep(userB.lifestyle.sleepSchedule)}`);
  } else {
    scheduleScore = 75;
  }

  // 6. Lifestyle: Cleanliness, Food, Social, Pets (max 15)
  let lifestyleScore = 80;

  // Cleanliness
  if (userA.lifestyle.cleanliness === userB.lifestyle.cleanliness) {
    lifestyleScore += 10;
    sharedTraits.push(`Same cleanliness standard (${userA.lifestyle.cleanliness})`);
  } else if (
    (userA.lifestyle.cleanliness === 'spotless' && userB.lifestyle.cleanliness === 'relaxed') ||
    (userA.lifestyle.cleanliness === 'relaxed' && userB.lifestyle.cleanliness === 'spotless')
  ) {
    lifestyleScore -= 25;
    differences.push('Opposite tidiness standards (Spotless vs Relaxed)');
  }

  // Food / Diet
  if (userA.lifestyle.foodDiet === userB.lifestyle.foodDiet) {
    lifestyleScore += 10;
    sharedTraits.push(`Shared diet preference (${formatDiet(userA.lifestyle.foodDiet)})`);
  } else if (
    (userA.lifestyle.foodDiet === 'vegetarian' || userA.lifestyle.foodDiet === 'vegan') &&
    userB.lifestyle.foodDiet === 'non_vegetarian'
  ) {
    // Only moderate difference, common in shared flats
    lifestyleScore -= 10;
    differences.push(`Dietary difference: ${formatDiet(userA.lifestyle.foodDiet)} vs ${formatDiet(userB.lifestyle.foodDiet)}`);
  }

  // Social vibe
  if (userA.lifestyle.socialVibe === userB.lifestyle.socialVibe) {
    lifestyleScore += 10;
    sharedTraits.push(`Aligned home social vibe (${formatSocial(userA.lifestyle.socialVibe)})`);
  }

  // Pets
  if (userA.lifestyle.pets === 'no_pets' && userB.lifestyle.pets === 'has_pets') {
    lifestyleScore -= 30;
    differences.push('Pet incompatibility (One has pet, one prefers pet-free)');
  } else if (userA.lifestyle.pets === 'has_pets' && userB.lifestyle.pets === 'no_pets') {
    lifestyleScore -= 30;
    differences.push('Pet incompatibility');
  } else if (userA.lifestyle.pets === 'has_pets' && userB.lifestyle.pets === 'comfortable_with_pets') {
    sharedTraits.push('Pet friendly household');
  }

  lifestyleScore = Math.max(15, Math.min(100, lifestyleScore));

  // Weights:
  // Budget: 25%, Location: 20%, Schedule: 20%, Habits: 15%, Lifestyle: 20%
  let overall = (budgetScore * 0.25) +
                (locationScore * 0.20) +
                (scheduleScore * 0.20) +
                (habitsScore * 0.15) +
                (lifestyleScore * 0.20);

  if (genderMismatch) {
    overall = Math.min(overall, 25);
  }

  return {
    overallScore: Math.round(overall),
    sharedTraits,
    differences,
    categoryScores: {
      budget: Math.round(budgetScore),
      location: Math.round(locationScore),
      lifestyle: Math.round(lifestyleScore),
      schedule: Math.round(scheduleScore),
      habits: Math.round(habitsScore)
    }
  };
}

function formatSleep(schedule: string) {
  if (schedule === 'early_bird') return 'Early Bird';
  if (schedule === 'night_owl') return 'Night Owl';
  return 'Flexible';
}

function formatDiet(diet: string) {
  if (diet === 'vegetarian') return 'Vegetarian';
  if (diet === 'non_vegetarian') return 'Non-Vegetarian';
  if (diet === 'eggetarian') return 'Eggetarian';
  if (diet === 'vegan') return 'Vegan';
  return 'No Preference';
}

function formatSocial(social: string) {
  if (social === 'quiet_private') return 'Peaceful & Quiet';
  if (social === 'social_outgoing') return 'Social & Outgoing';
  return 'Balanced Vibe';
}
