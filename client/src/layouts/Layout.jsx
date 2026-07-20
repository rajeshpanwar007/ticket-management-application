import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import Toast from '../components/common/Toast.jsx';

const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <Breadcrumbs />
        <Outlet />
      </main>
      <Toast />
    </div>
  );
};

export default Layout;
