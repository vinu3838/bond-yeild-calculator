export type CouponFrequency = 'annual' | 'semi-annual';

export interface BondCalculationRequest {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface CashFlowEntry {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondCalculationResponse {
  currentYield: number;
  yieldToMaturity: number;
  totalInterestEarned: number;
  premiumOrDiscount: 'premium' | 'discount' | 'par';
  premiumDiscountAmount: number;
  cashFlowSchedule: CashFlowEntry[];
}
