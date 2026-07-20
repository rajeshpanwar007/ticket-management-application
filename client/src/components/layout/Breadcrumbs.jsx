import { Link, useLocation, useParams } from 'react-router-dom';

// TODO: Implement dynamic breadcrumbs based on route

const Breadcrumbs = () => {
  const location = useLocation();
  const { id } = useParams();

  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/tickets">Tickets</Link>
      {id && <span> / Ticket {id}</span>}
      {location.pathname.endsWith('/edit') && <span> / Edit</span>}
    </nav>
  );
};

export default Breadcrumbs;
