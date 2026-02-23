import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { CashFlowEntry } from '@bond-calculator/shared';
import { formatCurrency, formatDate } from '../utils/formatters';

const ROWS_PER_PAGE = 10;

interface CashFlowTableProps {
  schedule: CashFlowEntry[];
}

export function CashFlowTable({ schedule }: CashFlowTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(schedule.length / ROWS_PER_PAGE);

  // Reset to page 1 when schedule changes
  useEffect(() => {
    setCurrentPage(1);
  }, [schedule]);

  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = schedule.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <div className="cashflow-section">
      <h2>Cash Flow Schedule</h2>
      <div className="table-wrapper">
        <table className="cashflow-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Payment Date</th>
              <th>Coupon Payment</th>
              <th>Cumulative Interest</th>
              <th>Remaining Principal</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((entry) => (
              <tr key={entry.period} className={entry.remainingPrincipal === 0 ? 'maturity-row' : ''}>
                <td>{entry.period}</td>
                <td>{formatDate(entry.paymentDate)}</td>
                <td>{formatCurrency(entry.couponPayment)}</td>
                <td>{formatCurrency(entry.cumulativeInterest)}</td>
                <td>{formatCurrency(entry.remainingPrincipal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <Button
              variant="outlined"
              size="small"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outlined"
              size="small"
              endIcon={<NavigateNextIcon />}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
