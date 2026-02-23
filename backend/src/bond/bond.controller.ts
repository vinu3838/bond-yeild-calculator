import { Controller, Post, Body } from '@nestjs/common';
import type { BondCalculationResponse } from '@bond-calculator/shared';
import { BondService } from './bond.service';
import { CalculateBondDto } from './dto/calculate-bond.dto';

@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateBondDto): BondCalculationResponse {
    return this.bondService.calculate(dto);
  }
}
