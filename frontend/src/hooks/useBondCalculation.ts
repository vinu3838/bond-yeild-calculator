import { useState } from 'react';
import type { BondCalculationRequest, BondCalculationResponse } from '@bond-calculator/shared';
import { calculateBond } from '../api/bondApi';

interface UseBondCalculationReturn {
  results: BondCalculationResponse | null;
  error: string | null;
  isLoading: boolean;
  calculate: (data: BondCalculationRequest) => Promise<void>;
}

export function useBondCalculation(): UseBondCalculationReturn {
  const [results, setResults] = useState<BondCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculate = async (data: BondCalculationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await calculateBond(data);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, error, isLoading, calculate };
}
