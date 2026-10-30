import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BudgetPage from './pages/BudgetPage';
import InsightPage from './pages/InsightPage';
import VaultPage from './pages/VaultPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="insight" element={<InsightPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
