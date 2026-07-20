import { Link } from 'react-router-dom';

// TODO: Implement back link component

const BackLink = ({ to, label = 'Back' }) => {
  return (
    <Link to={to} className="back-link">
      ← {label}
    </Link>
  );
};

export default BackLink;
