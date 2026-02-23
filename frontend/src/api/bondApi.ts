import type { BondCalculationRequest, BondCalculationResponse } from '@bond-calculator/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function calculateBond(data: BondCalculationRequest): Promise<BondCalculationResponse> {
  const response = await fetch(`${API_BASE}/bond/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || 'Calculation failed');
  }

  return response.json();
}
