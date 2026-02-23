import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { BondForm } from './components/BondForm';
import { BondResults } from './components/BondResults';
import { CashFlowTable } from './components/CashFlowTable';
import { useBondCalculation } from './hooks/useBondCalculation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

function AppContent() {
  const { results, error, isLoading, calculate } = useBondCalculation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <header className="app-header">
        <IconButton
          onClick={toggleTheme}
          title="Toggle theme"
          size="small"
          sx={{ position: 'absolute', top: 0, right: 0, color: 'var(--color-text)' }}
        >
          {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <h1>Bond Yield Calculator</h1>
        <p>Calculate current yield, yield to maturity, and view the cash flow schedule for any bond.</p>
      </header>

      <main className="app-main">
        <BondForm onSubmit={calculate} isLoading={isLoading} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {results && (
          <>
            <BondResults results={results} />
            <CashFlowTable schedule={results.cashFlowSchedule} />
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
