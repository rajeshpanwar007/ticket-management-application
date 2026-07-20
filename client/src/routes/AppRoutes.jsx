import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import TicketListPage from '../pages/TicketListPage.jsx';
import CreateTicketPage from '../pages/CreateTicketPage.jsx';
import TicketDetailPage from '../pages/TicketDetailPage.jsx';
import EditTicketPage from '../pages/EditTicketPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';

// TODO: Add ProtectedRoute wrapper for stretch auth

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="tickets/:id/edit" element={<EditTicketPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
