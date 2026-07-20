import { NavLink } from 'react-router-dom';

// TODO: Implement navbar with responsive menu

const Navbar = () => {
  return (
    <header className="navbar">
      <nav className="navbar__nav">
        <NavLink to="/" className="navbar__brand">
          TicketManager
        </NavLink>
        <NavLink to="/" className="navbar__link">
          Dashboard
        </NavLink>
        <NavLink to="/tickets" className="navbar__link">
          Tickets
        </NavLink>
        <NavLink to="/tickets/new" className="navbar__link navbar__link--cta">
          + New
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
