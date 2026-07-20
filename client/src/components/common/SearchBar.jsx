// TODO: Implement search bar with debounced onChange

const SearchBar = ({ value, onChange, placeholder = 'Search tickets...' }) => {
  return (
    <input
      type="search"
      className="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search tickets"
    />
  );
};

export default SearchBar;
