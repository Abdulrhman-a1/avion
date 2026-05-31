import { ARTICLE_CATEGORIES } from '../constants';

export default function SearchFilter({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories = ARTICLE_CATEGORIES,
  placeholder = 'Search…',
}) {
  return (
    <div className="community-filters">
      <input
        type="search"
        className="community-search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      <select
        className="community-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
