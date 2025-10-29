import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import TSOTable from './components/Inventories/TSOTable';
import InvoicesTable from './components/Invoices/InvoicesTable';
import LogsViewer from './components/Log/Log';
import { ToastFix } from '../src/utils/ToastFix';
import 'react-toastify/dist/ReactToastify.css';
import '../src/utils/notify';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="tso" replace />} />
          <Route path="tso" element={<TSOTable />} />
          <Route path="invoices" element={<InvoicesTable />} />
          <Route path="logs" element={<LogsViewer />} />
        </Route>
      </Routes>
      
      <ToastFix />
    </BrowserRouter>
  );
}

export default App;