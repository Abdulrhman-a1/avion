import { Link } from 'react-router-dom';
import { formatArticlePreview } from '../api/communityApi';

export default function ArticleCard({ article }) {
  const preview = article.summary || formatArticlePreview(article.content);

  return (
    <article className="community-card article-card">
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="community-card-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <span className="community-chip community-chip--green">{article.category}</span>
      <h3 className="community-card-title">
        <Link to={`/community/articles/${article.id}`}>{article.title}</Link>
      </h3>
      <p className="community-card-meta">
        By {article.author}
        {article.publishedAt && (
          <> · {new Date(article.publishedAt).toLocaleDateString()}</>
        )}
      </p>
      <p className="community-card-desc">{preview}</p>
      <Link to={`/community/articles/${article.id}`} className="community-card-link">
        Read article →
      </Link>
    </article>
  );
}
