import { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CalculateIcon from '@mui/icons-material/Calculate';
import type { BondCalculationRequest, CouponFrequency } from '@bond-calculator/shared';

interface BondFormProps {
  onSubmit: (data: BondCalculationRequest) => void;
  isLoading: boolean;
}

export function BondForm({ onSubmit, isLoading }: BondFormProps) {
  const [faceValue, setFaceValue] = useState('1000');
  const [annualCouponRate, setAnnualCouponRate] = useState('5');
  const [marketPrice, setMarketPrice] = useState('950');
  const [yearsToMaturity, setYearsToMaturity] = useState('10');
  const [couponFrequency, setCouponFrequency] = useState<CouponFrequency>('annual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      faceValue: parseFloat(faceValue),
      annualCouponRate: parseFloat(annualCouponRate),
      marketPrice: parseFloat(marketPrice),
      yearsToMaturity: parseFloat(yearsToMaturity),
      couponFrequency,
    });
  };

  return (
    <form className="bond-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <TextField
          label="Face Value"
          type="number"
          value={faceValue}
          onChange={(e) => setFaceValue(e.target.value)}
          inputProps={{ min: 0.01, step: 'any' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          required
          size="small"
          fullWidth
        />

        <TextField
          label="Annual Coupon Rate"
          type="number"
          value={annualCouponRate}
          onChange={(e) => setAnnualCouponRate(e.target.value)}
          inputProps={{ min: 0, max: 100, step: 'any' }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          required
          size="small"
          fullWidth
        />

        <TextField
          label="Market Price"
          type="number"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
          inputProps={{ min: 0.01, step: 'any' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          required
          size="small"
          fullWidth
        />

        <TextField
          label="Years to Maturity"
          type="number"
          value={yearsToMaturity}
          onChange={(e) => setYearsToMaturity(e.target.value)}
          inputProps={{ min: 0.5, max: 100, step: 'any' }}
          required
          size="small"
          fullWidth
        />

        <TextField
          label="Coupon Frequency"
          select
          value={couponFrequency}
          onChange={(e) => setCouponFrequency(e.target.value as CouponFrequency)}
          size="small"
          fullWidth
        >
          <MenuItem value="annual">Annual</MenuItem>
          <MenuItem value="semi-annual">Semi-Annual</MenuItem>
        </TextField>
      </div>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoading}
        startIcon={<CalculateIcon />}
      >
        {isLoading ? 'Calculating...' : 'Calculate'}
      </Button>
    </form>
  );
}
