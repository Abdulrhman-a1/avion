import { useState } from 'react';

export default function AdminArticleRow({
  article,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  onReview,
  busy,
}) {
  const [reason, setReason] = useState('');

  return (
    <tr className="admin-row">
      <td>
        <strong>{article.title}</strong>
        <p className="admin-row-meta">{article.author} · {article.category}</p>
        {article.summary && <p className="admin-row-preview">{article.summary}</p>}
      </td>
      <td>
        <span className={`admin-status admin-status--${article.status}`}>{article.status}</span>
      </td>
      <td>{new Date(article.submittedAt).toLocaleDateString()}</td>
      <td className="admin-row-actions">
        <button
          type="button"
          className="community-btn community-btn--secondary"
          disabled={busy}
          onClick={() => onReview(article)}
        >
          Review
        </button>
        {article.status === 'pending' && (
          <>
            <button
              type="button"
              className="community-btn community-btn--primary"
              disabled={busy}
              onClick={() => onApprove(article.id)}
            >
              Approve
            </button>
            <div className="admin-reject-wrap">
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
        <button
          type="button"
          className="community-btn community-btn--ghost"
          disabled={busy}
          onClick={() => onDelete(article.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
