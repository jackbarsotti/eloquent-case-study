import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserDetail } from './pages/UserDetail';

export function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user/:id" element={<UserDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}
