import { useState } from 'react';
import { Link } from 'react-router-dom';
import MarkdownContent from './MarkdownContent';

export default function AdminArticleReviewPanel({ article, onApprove, onReject, onEdit, onClose, busy }) {
  const [reason, setReason] = useState('');

  if (!article) return null;

  return (
    <section className="admin-review-panel">
      <div className="admin-review-head">
        <div>
          <span className={`admin-status admin-status--${article.status}`}>{article.status}</span>
          <h2>{article.title}</h2>
          <p className="admin-row-meta">
            {article.author} · {article.category} · Submitted{' '}
            {new Date(article.submittedAt).toLocaleString()}
          </p>
        </div>
        <button type="button" className="community-btn community-btn--ghost" onClick={onClose}>
          Close
        </button>
      </div>

      {article.summary && <p className="admin-review-summary">{article.summary}</p>}

      <div className="admin-review-body">
        <MarkdownContent content={article.content} />
      </div>

      <div className="admin-review-actions">
        {article.status === 'pending' && (
          <>
            <button
              type="button"
              className="community-btn community-btn--primary"
              disabled={busy}
              onClick={() => onApprove(article.id)}
            >
              Approve & publish
            </button>
            <div className="admin-reject-wrap admin-reject-wrap--row">
              <input
                type="text"
                className="community-input admin-reject-input"
                placeholder="Rejection reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                type="button"
                className="community-btn community-btn--danger"
                disabled={busy}
                onClick={() => onReject(article.id, reason)}
              >
                Reject
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          className="community-btn community-btn--secondary"
          disabled={busy}
          onClick={() => onEdit(article)}
        >
          Edit
        </button>
        {article.status === 'approved' && (
          <Link
            to={`/community/articles/${article.id}`}
            className="community-btn community-btn--ghost"
            target="_blank"
            rel="noreferrer"
          >
            View public page
          </Link>
        )}
      </div>
    </section>
  );
}
