import { IsNumber, IsPositive, Min, Max, IsIn } from 'class-validator';
import type { CouponFrequency } from '@bond-calculator/shared';

export class CalculateBondDto {
  @IsNumber()
  @IsPositive()
  faceValue: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  annualCouponRate: number;

  @IsNumber()
  @IsPositive()
  marketPrice: number;

  @IsNumber()
  @IsPositive()
  @Max(100)
  yearsToMaturity: number;

  @IsIn(['annual', 'semi-annual'])
  couponFrequency: CouponFrequency;
}
