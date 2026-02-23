import type { BondCalculationResponse } from '@bond-calculator/shared';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface BondResultsProps {
  results: BondCalculationResponse;
}

export function BondResults({ results }: BondResultsProps) {
  const premiumDiscountLabel =
    results.premiumOrDiscount === 'premium'
      ? `Premium (+${formatCurrency(results.premiumDiscountAmount)})`
      : results.premiumOrDiscount === 'discount'
        ? `Discount (-${formatCurrency(results.premiumDiscountAmount)})`
        : 'Par';

  const premiumDiscountClass =
    results.premiumOrDiscount === 'discount'
      ? 'metric-card discount'
      : results.premiumOrDiscount === 'premium'
        ? 'metric-card premium'
        : 'metric-card par';

  return (
    <div className="results-section">
      <h2>Results</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Current Yield</span>
          <span className="metric-value yield">{formatPercentage(results.currentYield)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Yield to Maturity (YTM)</span>
          <span className="metric-value yield">{formatPercentage(results.yieldToMaturity)}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Interest Earned</span>
          <span className="metric-value interest">{formatCurrency(results.totalInterestEarned)}</span>
        </div>
        <div className={premiumDiscountClass}>
          <span className="metric-label">Trading Status</span>
          <span className="metric-value">{premiumDiscountLabel}</span>
        </div>
      </div>
    </div>
  );
}
