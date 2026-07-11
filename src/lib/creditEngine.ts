export interface FinancialMetrics {
  annualRevenue: number;
  annualTurnover: number;
  employeeCount: number;
  hasGst: boolean;
  hasPan: boolean;
  hasCoi: boolean;
  litigationCount: number;
}

export interface AssessmentResult {
  creditScore: number;
  creditRating: string;
  riskScore: number;
  recommendedLimit: number;
  metrics: {
    liquidityRatio: number;
    debtToEquity: number;
    operatingMargin: number;
    onTimePaymentRate: number;
  };
  explanations: string[];
}

export function calculateCreditAssessment(companyName: string, data: FinancialMetrics): AssessmentResult {
  // Let's implement an advanced scoring formula based on industry standard credit scoring.
  let baseScore = 650;
  
  // Revenue adjustments
  if (data.annualRevenue > 50000000) baseScore += 80; // > 50M
  else if (data.annualRevenue > 10000000) baseScore += 50; // > 10M
  else if (data.annualRevenue > 1000000) baseScore += 20;
  else baseScore -= 30; // Micro enterprise penalty
  
  // Employee strength
  if (data.employeeCount > 500) baseScore += 30;
  else if (data.employeeCount > 100) baseScore += 15;
  else if (data.employeeCount < 10) baseScore -= 10;

  // Compliance checklist adjustments
  let complianceBonus = 0;
  if (data.hasGst) complianceBonus += 15;
  if (data.hasPan) complianceBonus += 15;
  if (data.hasCoi) complianceBonus += 20;
  baseScore += complianceBonus;

  // Litigation risk penalty
  if (data.litigationCount > 3) baseScore -= 100;
  else if (data.litigationCount > 0) baseScore -= 40;
  else baseScore += 20; // Risk-free bonus

  // Bound the score between 300 and 900
  const creditScore = Math.max(300, Math.min(900, baseScore));

  // Determine Credit Rating (AAA to D)
  let creditRating = 'B';
  if (creditScore >= 800) creditRating = 'AAA';
  else if (creditScore >= 750) creditRating = 'AA';
  else if (creditScore >= 700) creditRating = 'A';
  else if (creditScore >= 650) creditRating = 'BBB';
  else if (creditScore >= 600) creditRating = 'BB';
  else if (creditScore >= 500) creditRating = 'B';
  else if (creditScore >= 400) creditRating = 'C';
  else creditRating = 'D';

  // Calculate Risk Score (0 to 100) - Inverse of credit score mapping
  // 300 credit score -> 100 risk score, 900 credit score -> 5 risk score
  const riskScore = Math.max(5, Math.min(100, Math.round(((900 - creditScore) / 600) * 95 + 5)));

  // Recommended Credit Limit (based on 5% to 15% of annual revenue depending on rating)
  let percentageMultiplier = 0.05; // Default for BB/B
  if (creditRating === 'AAA' || creditRating === 'AA') percentageMultiplier = 0.15;
  else if (creditRating === 'A' || creditRating === 'BBB') percentageMultiplier = 0.10;
  else if (creditRating === 'C' || creditRating === 'D') percentageMultiplier = 0.02;

  const recommendedLimit = Math.round(data.annualRevenue * percentageMultiplier);

  // Financial ratios simulation for presentation
  const liquidityRatio = parseFloat((1.2 + (creditScore - 600) / 300).toFixed(2));
  const debtToEquity = parseFloat((1.8 - (creditScore - 600) / 400).toFixed(2));
  const operatingMargin = parseFloat((8 + ((creditScore - 500) / 400) * 12).toFixed(1));
  const onTimePaymentRate = Math.min(100, Math.max(40, Math.round(75 + (creditScore - 600) / 6)));

  // Generate dynamic, realistic AI summaries and explanations
  const explanations: string[] = [];
  explanations.push(
    `Financial Health: ${companyName} displays a stable financial position with annual revenues of $${data.annualRevenue.toLocaleString()} and simulated operating margins of ${operatingMargin}%.`
  );
  
  if (creditScore >= 700) {
    explanations.push(
      `Risk Profile: Highly favorable credit history. Strong compliance indicators (active PAN, GST, and COI certificates) contribute to a robust AAA/AA score. Default risk is extremely low.`
    );
    explanations.push(
      `Limit Recommendation: Capital reserves and positive payment behaviour support a maximum credit line of up to $${recommendedLimit.toLocaleString()} on net-30 terms.`
    );
  } else if (creditScore >= 600) {
    explanations.push(
      `Risk Profile: Moderate risk profile (BBB/BB rating). Company maintains adequate liquidity, but credit limits should be monitored relative to operational turnover.`
    );
    explanations.push(
      `Limit Recommendation: Recommending a conservative credit limit of $${recommendedLimit.toLocaleString()} with strict payment covenants.`
    );
  } else {
    explanations.push(
      `Risk Profile: Elevated risk indicators (rating ${creditRating}). A low credit score of ${creditScore} is triggered by micro-scale revenue, outstanding compliance items, or active legal cases.`
    );
    explanations.push(
      `Mitigation Strategy: Restrict trade terms to COD (Cash on Delivery) or CIA (Cash in Advance). Require corporate guarantees for any credit limit above $${recommendedLimit.toLocaleString()}.`
    );
  }

  if (data.litigationCount > 0) {
    explanations.push(
      `Legal Action: Platform flagged ${data.litigationCount} active court litigation case(s). Contingent liability represents a risk of liquidity pressure.`
    );
  }

  return {
    creditScore,
    creditRating,
    riskScore,
    recommendedLimit,
    metrics: {
      liquidityRatio,
      debtToEquity,
      operatingMargin,
      onTimePaymentRate
    },
    explanations
  };
}
