import { BondService } from '../bond.service';

describe('BondService', () => {
  let service: BondService;

  beforeEach(() => {
    service = new BondService();
  });

  describe('Standard discount bond (annual)', () => {
    it('should calculate correct values for a discount bond', () => {
      const result = service.calculate({
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 10,
        couponFrequency: 'annual',
      });

      // Current yield = (50 / 950) * 100 ≈ 5.2632%
      expect(result.currentYield).toBeCloseTo(5.2632, 2);

      // YTM ≈ 5.66% (Newton-Raphson)
      expect(result.yieldToMaturity).toBeGreaterThan(5.0);
      expect(result.yieldToMaturity).toBeLessThan(6.5);

      expect(result.totalInterestEarned).toBe(500);
      expect(result.premiumOrDiscount).toBe('discount');
      expect(result.premiumDiscountAmount).toBe(50);
      expect(result.cashFlowSchedule).toHaveLength(10);
    });
  });

  describe('Premium bond (semi-annual)', () => {
    it('should calculate correct values for a premium bond', () => {
      const result = service.calculate({
        faceValue: 1000,
        annualCouponRate: 8,
        marketPrice: 1100,
        yearsToMaturity: 5,
        couponFrequency: 'semi-annual',
      });

      // Current yield = (80 / 1100) * 100 ≈ 7.2727%
      expect(result.currentYield).toBeCloseTo(7.2727, 2);

      // YTM ≈ 5.69%
      expect(result.yieldToMaturity).toBeGreaterThan(4.5);
      expect(result.yieldToMaturity).toBeLessThan(7.0);

      // Total interest = 40 * 10 = 400
      expect(result.totalInterestEarned).toBe(400);
      expect(result.premiumOrDiscount).toBe('premium');
      expect(result.premiumDiscountAmount).toBe(100);

      // 5 years semi-annual = 10 periods
      expect(result.cashFlowSchedule).toHaveLength(10);
      expect(result.cashFlowSchedule[0].couponPayment).toBe(40);
    });
  });

  describe('Par bond', () => {
    it('should calculate correct values when price equals face value', () => {
      const result = service.calculate({
        faceValue: 1000,
        annualCouponRate: 6,
        marketPrice: 1000,
        yearsToMaturity: 5,
        couponFrequency: 'annual',
      });

      expect(result.currentYield).toBeCloseTo(6.0, 1);
      // At par, YTM ≈ coupon rate
      expect(result.yieldToMaturity).toBeCloseTo(6.0, 1);
      expect(result.premiumOrDiscount).toBe('par');
      expect(result.premiumDiscountAmount).toBe(0);
      expect(result.totalInterestEarned).toBe(300);
    });
  });

  describe('Zero-coupon bond', () => {
    it('should use closed-form YTM for zero-coupon bonds', () => {
      const result = service.calculate({
        faceValue: 1000,
        annualCouponRate: 0,
        marketPrice: 600,
        yearsToMaturity: 10,
        couponFrequency: 'annual',
      });

      expect(result.currentYield).toBe(0);
      // YTM = ((1000/600)^(1/10) - 1) * 100 ≈ 5.24%
      expect(result.yieldToMaturity).toBeCloseTo(5.2410, 1);
      expect(result.totalInterestEarned).toBe(0);
      expect(result.premiumOrDiscount).toBe('discount');
      expect(result.premiumDiscountAmount).toBe(400);
      expect(result.cashFlowSchedule).toHaveLength(10);
      expect(result.cashFlowSchedule[0].couponPayment).toBe(0);
    });
  });

  describe('Cash flow schedule', () => {
    it('should have correct structure and final period principal of 0', () => {
      const result = service.calculate({
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 3,
        couponFrequency: 'annual',
      });

      expect(result.cashFlowSchedule).toHaveLength(3);

      // Check cumulative interest
      expect(result.cashFlowSchedule[0].cumulativeInterest).toBe(50);
      expect(result.cashFlowSchedule[1].cumulativeInterest).toBe(100);
      expect(result.cashFlowSchedule[2].cumulativeInterest).toBe(150);

      // Remaining principal: face value until last period
      expect(result.cashFlowSchedule[0].remainingPrincipal).toBe(1000);
      expect(result.cashFlowSchedule[1].remainingPrincipal).toBe(1000);
      expect(result.cashFlowSchedule[2].remainingPrincipal).toBe(0);

      // Payment dates should be valid ISO date strings
      result.cashFlowSchedule.forEach((entry) => {
        expect(entry.paymentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });
});
