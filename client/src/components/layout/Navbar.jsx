import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        TicketManager
      </NavLink>
      <nav className="navbar__links" aria-label="Main navigation">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/tickets">Tickets</NavLink>
        <NavLink to="/tickets/new">+ New</NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
