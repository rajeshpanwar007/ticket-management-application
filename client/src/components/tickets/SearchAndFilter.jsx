import SearchBar from '../common/SearchBar.jsx';
import StatusFilter from '../common/StatusFilter.jsx';

// TODO: Implement search and filter bar

const SearchAndFilter = ({ search, status, onSearchChange, onStatusChange }) => {
  return (
    <div className="search-and-filter">
      <SearchBar value={search} onChange={onSearchChange} />
      <StatusFilter value={status} onChange={onStatusChange} />
    </div>
  );
};

export default SearchAndFilter;
