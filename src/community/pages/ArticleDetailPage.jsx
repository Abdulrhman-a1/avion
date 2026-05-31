import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownContent from '../components/MarkdownContent';
import { SkeletonDetail } from '../components/SkeletonCard';
import { fetchArticle } from '../api/communityApi';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArticle(id)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="community-page">
        <SkeletonDetail />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="community-page">
        <p className="community-muted">Article not found.</p>
        <Link to="/community/articles" className="community-card-link">
          ← Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Link to="/community/articles" className="community-back-link">
        ← Back to articles
      </Link>

      <article className="article-detail">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="article-detail-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span className="community-chip community-chip--green">{article.category}</span>
        <h1 className="article-detail-title">{article.title}</h1>
        <p className="article-detail-meta">
          By {article.author}
          {article.publishedAt && (
            <> · Published {new Date(article.publishedAt).toLocaleDateString()}</>
          )}
        </p>
        <div className="article-detail-body">
          <MarkdownContent content={article.content} />
        </div>

        {article.pdfUrl && (
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="article-pdf-download"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Download PDF
          </a>
        )}
      </article>
    </div>
  );
}
