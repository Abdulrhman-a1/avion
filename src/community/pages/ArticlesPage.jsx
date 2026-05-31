import { useEffect, useMemo, useState } from 'react';
import ArticleCard from '../components/ArticleCard';
import SearchFilter from '../components/SearchFilter';
import { SkeletonGrid } from '../components/SkeletonCard';
import { fetchArticles } from '../api/communityApi';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArticles({ category, q: query })
      .then((data) => {
        if (!cancelled) setArticles(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading…';
    return `${articles.length} article${articles.length === 1 ? '' : 's'}`;
  }, [articles.length, loading]);

  return (
    <div className="community-page">
      <header className="community-page-header">
        <h1>Community articles</h1>
        <p className="community-page-desc">
          Tips, case studies, and lessons from STEM Racing project managers.
        </p>
      </header>

      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        placeholder="Search articles…"
      />

      <p className="community-count">{countLabel}</p>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : articles.length === 0 ? (
        <p className="community-muted">No articles match your filters.</p>
      ) : (
        <div className="community-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
