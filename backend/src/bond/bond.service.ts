import { Injectable } from '@nestjs/common';
import type {
  BondCalculationResponse,
  CashFlowEntry,
} from '@bond-calculator/shared';
import { CalculateBondDto } from './dto/calculate-bond.dto';

@Injectable()
export class BondService {
  calculate(dto: CalculateBondDto): BondCalculationResponse {
    const { faceValue, annualCouponRate, marketPrice, yearsToMaturity, couponFrequency } = dto;

    const periodsPerYear = couponFrequency === 'semi-annual' ? 2 : 1;
    const totalPeriods = yearsToMaturity * periodsPerYear;
    const annualCoupon = faceValue * (annualCouponRate / 100);
    const couponPerPeriod = annualCoupon / periodsPerYear;

    const currentYield = this.calculateCurrentYield(annualCoupon, marketPrice);
    const yieldToMaturity = this.calculateYTM(faceValue, couponPerPeriod, marketPrice, totalPeriods, periodsPerYear);
    const totalInterestEarned = couponPerPeriod * totalPeriods;
    const { premiumOrDiscount, premiumDiscountAmount } = this.determinePremiumDiscount(marketPrice, faceValue);
    const cashFlowSchedule = this.generateCashFlowSchedule(couponPerPeriod, faceValue, totalPeriods, periodsPerYear);

    return {
      currentYield: parseFloat(currentYield.toFixed(4)),
      yieldToMaturity: parseFloat(yieldToMaturity.toFixed(4)),
      totalInterestEarned: parseFloat(totalInterestEarned.toFixed(2)),
      premiumOrDiscount,
      premiumDiscountAmount: parseFloat(premiumDiscountAmount.toFixed(2)),
      cashFlowSchedule,
    };
  }

  private calculateCurrentYield(annualCoupon: number, marketPrice: number): number {
    if (marketPrice === 0) return 0;
    return (annualCoupon / marketPrice) * 100;
  }

  private calculateYTM(
    faceValue: number,
    couponPerPeriod: number,
    marketPrice: number,
    totalPeriods: number,
    periodsPerYear: number,
  ): number {
    // Zero-coupon bond: closed-form solution
    if (couponPerPeriod === 0) {
      if (marketPrice <= 0 || faceValue <= 0) return 0;
      const ytmPerPeriod = Math.pow(faceValue / marketPrice, 1 / totalPeriods) - 1;
      return ytmPerPeriod * periodsPerYear * 100;
    }

    const C = couponPerPeriod;
    const F = faceValue;
    const P = marketPrice;
    const n = totalPeriods;

    // Initial guess using approximation formula
    let r = (C + (F - P) / n) / ((F + P) / 2);

    // Ensure initial guess is positive
    if (r <= 0) r = 0.01;

    const maxIterations = 1000;
    const tolerance = 1e-10;

    for (let i = 0; i < maxIterations; i++) {
      let price = 0;
      let dPrice = 0;

      for (let t = 1; t <= n; t++) {
        const df = Math.pow(1 + r, t);
        price += C / df;
        dPrice -= (t * C) / (df * (1 + r));
      }

      const dfN = Math.pow(1 + r, n);
      price += F / dfN;
      dPrice -= (n * F) / (dfN * (1 + r));

      const diff = price - P;

      if (Math.abs(dPrice) < 1e-15) break;

      const delta = diff / dPrice;
      r = r - delta;

      // Prevent negative yield rate during iteration
      if (r <= -1) r = 0.001;

      if (Math.abs(delta) < tolerance) break;
    }

    return r * periodsPerYear * 100;
  }

  private determinePremiumDiscount(
    marketPrice: number,
    faceValue: number,
  ): { premiumOrDiscount: 'premium' | 'discount' | 'par'; premiumDiscountAmount: number } {
    if (marketPrice > faceValue) {
      return { premiumOrDiscount: 'premium', premiumDiscountAmount: marketPrice - faceValue };
    } else if (marketPrice < faceValue) {
      return { premiumOrDiscount: 'discount', premiumDiscountAmount: faceValue - marketPrice };
    }
    return { premiumOrDiscount: 'par', premiumDiscountAmount: 0 };
  }

  private generateCashFlowSchedule(
    couponPerPeriod: number,
    faceValue: number,
    totalPeriods: number,
    periodsPerYear: number,
  ): CashFlowEntry[] {
    const schedule: CashFlowEntry[] = [];
    const today = new Date();
    const monthsPerPeriod = 12 / periodsPerYear;

    for (let t = 1; t <= totalPeriods; t++) {
      const paymentDate = new Date(today);
      paymentDate.setMonth(paymentDate.getMonth() + t * monthsPerPeriod);

      schedule.push({
        period: t,
        paymentDate: paymentDate.toISOString().split('T')[0],
        couponPayment: parseFloat(couponPerPeriod.toFixed(2)),
        cumulativeInterest: parseFloat((couponPerPeriod * t).toFixed(2)),
        remainingPrincipal: t < totalPeriods ? faceValue : 0,
      });
    }

    return schedule;
  }
}
