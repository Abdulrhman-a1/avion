import { useEffect, useState } from 'react';
import { ARTICLE_CATEGORIES } from '../constants';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import PdfUpload from './PdfUpload';

const emptyArticle = {
  title: '',
  author: 'Admin',
  category: ARTICLE_CATEGORIES[0],
  summary: '',
  content: '',
  status: 'approved',
  coverImage: '',
  pdfUrl: '',
};

export default function AdminArticleForm({
  initial = emptyArticle,
  submitLabel = 'Save article',
  onSubmit,
  onCancel,
  busy = false,
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial.id, initial.title, initial.content]);

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label className="community-field">
          <span className="community-field-label">Title</span>
          <input
            className="community-input"
            value={form.title}
            onChange={(e) => handleChange('title')(e.target.value)}
            required
          />
        </label>

        <label className="community-field">
          <span className="community-field-label">Author</span>
          <input
            className="community-input"
            value={form.author}
            onChange={(e) => handleChange('author')(e.target.value)}
            required
          />
        </label>

        <label className="community-field">
          <span className="community-field-label">Category</span>
          <select
            className="community-select community-select--full"
            value={form.category}
            onChange={(e) => handleChange('category')(e.target.value)}
          >
            {ARTICLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="community-field">
          <span className="community-field-label">Status</span>
          <select
            className="community-select community-select--full"
            value={form.status}
            onChange={(e) => handleChange('status')(e.target.value)}
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <label className="community-field">
        <span className="community-field-label">Summary</span>
        <input
          className="community-input"
          value={form.summary}
          onChange={(e) => handleChange('summary')(e.target.value)}
        />
      </label>

      <ImageUpload value={form.coverImage || ''} onChange={handleChange('coverImage')} />

      <PdfUpload value={form.pdfUrl || ''} onChange={handleChange('pdfUrl')} />

      <RichTextEditor
        id="admin-article-content"
        label="Content"
        value={form.content}
        onChange={handleChange('content')}
      />

      <div className="admin-form-actions">
        <button type="submit" className="community-btn community-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="community-btn community-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export { emptyArticle };
