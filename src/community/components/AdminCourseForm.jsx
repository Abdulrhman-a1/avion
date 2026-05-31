import { useEffect, useState } from 'react';
import { COURSE_CATEGORIES } from '../constants';
import RichTextEditor from './RichTextEditor';

const emptyCourse = {
  title: '',
  category: COURSE_CATEGORIES[0],
  order: '1',
  summary: '',
  content: '',
};

export default function AdminCourseForm({
  initial = emptyCourse,
  submitLabel = 'Save guide',
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
          <span className="community-field-label">Category</span>
          <select
            className="community-select community-select--full"
            value={form.category}
            onChange={(e) => handleChange('category')(e.target.value)}
          >
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="community-field">
          <span className="community-field-label">Order</span>
          <input
            type="number"
            min="1"
            className="community-input"
            value={form.order}
            onChange={(e) => handleChange('order')(e.target.value)}
            required
          />
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

      <RichTextEditor
        id="admin-course-content"
        label="Guide content"
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

export { emptyCourse };
