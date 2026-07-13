// Proventa Plan Feature Gating Utility
// Controls access to features based on the organization's subscription plan

export const PLAN_LIMITS = {
  FREE: {
    assessments: 5,
    customers: 10,
    invoices: 20,
    teamMembers: 2,
    exports: false,
    aiForecasting: false,
    benchmarking: false,
    whiteLabel: false,
  },
  PRO: {
    assessments: 50,
    customers: 100,
    invoices: 500,
    teamMembers: 10,
    exports: true,
    aiForecasting: true,
    benchmarking: true,
    whiteLabel: false,
  },
  ENTERPRISE: {
    assessments: -1,
    customers: -1,
    invoices: -1,
    teamMembers: -1,
    exports: true,
    aiForecasting: true,
    benchmarking: true,
    whiteLabel: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type PlanFeature = keyof typeof PLAN_LIMITS.FREE;

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Growth',
  ENTERPRISE: 'Enterprise',
};

const UPGRADE_MESSAGES: Partial<Record<PlanFeature, string>> = {
  exports: 'Upgrade to Growth or Enterprise to export reports and data.',
  aiForecasting: 'AI Forecasting is available on Growth and Enterprise plans.',
  benchmarking: 'Industry Benchmarking is available on Growth and Enterprise plans.',
  whiteLabel: 'White-label branding is an exclusive Enterprise feature.',
  assessments: 'You have reached your credit assessment limit for this plan.',
  customers: 'You have reached your customer limit for this plan.',
  invoices: 'You have reached your invoice tracking limit for this plan.',
  teamMembers: 'You have reached the team member limit for this plan.',
};

/**
 * Checks whether an action is allowed on the current plan.
 * For boolean features: checks if the feature flag is enabled.
 * For numeric limits: compares currentCount vs the plan ceiling. -1 means unlimited.
 */
export function checkLimit(
  planType: string,
  feature: PlanFeature,
  currentCount?: number
): { allowed: boolean; limit: number | boolean; message: string } {
  const normalizedPlan = (planType || 'FREE').toUpperCase() as PlanType;
  const planLimits = PLAN_LIMITS[normalizedPlan] ?? PLAN_LIMITS.FREE;
  const limitValue = planLimits[feature];
  const planName = PLAN_DISPLAY_NAMES[normalizedPlan] || normalizedPlan;
  const upgradeMsg = UPGRADE_MESSAGES[feature] || `This feature requires a higher plan than ${planName}.`;

  // Boolean feature flag
  if (typeof limitValue === 'boolean') {
    return {
      allowed: limitValue,
      limit: limitValue,
      message: limitValue ? 'Feature enabled.' : upgradeMsg,
    };
  }

  // Numeric limit: -1 means unlimited
  if (limitValue === -1) {
    return {
      allowed: true,
      limit: -1,
      message: 'Unlimited on Enterprise plan.',
    };
  }

  // Count-based gate
  const count = currentCount ?? 0;
  const allowed = count < limitValue;
  return {
    allowed,
    limit: limitValue,
    message: allowed
      ? `${count}/${limitValue} used on ${planName} plan.`
      : upgradeMsg,
  };
}

/**
 * Returns the full plan limits object for a given plan type.
 */
export function getPlanLimits(planType: string): typeof PLAN_LIMITS.FREE {
  const normalizedPlan = (planType || 'FREE').toUpperCase() as PlanType;
  return PLAN_LIMITS[normalizedPlan] ?? PLAN_LIMITS.FREE;
}

/**
 * Returns the display label for a plan type.
 */
export function getPlanDisplayName(planType: string): string {
  const normalizedPlan = (planType || 'FREE').toUpperCase();
  return PLAN_DISPLAY_NAMES[normalizedPlan] || normalizedPlan;
}

/**
 * Checks whether a plan is at or above a required plan tier.
 */
export function isPlanAtLeast(currentPlan: string, requiredPlan: PlanType): boolean {
  const hierarchy: Record<PlanType, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
  const current = (currentPlan || 'FREE').toUpperCase() as PlanType;
  return (hierarchy[current] ?? 0) >= (hierarchy[requiredPlan] ?? 0);
}

/**
 * Returns usage percentage for a numeric feature (0-100). Returns -1 for unlimited.
 */
export function getUsagePercentage(planType: string, feature: PlanFeature, currentCount: number): number {
  const planLimits = getPlanLimits(planType);
  const limit = planLimits[feature];
  if (typeof limit !== 'number' || limit === -1) return -1;
  if (limit === 0) return 100;
  return Math.min(100, Math.round((currentCount / limit) * 100));
}
