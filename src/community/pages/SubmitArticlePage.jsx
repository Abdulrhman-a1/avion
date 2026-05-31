import { useState } from 'react';
import { Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import ImageUpload from '../components/ImageUpload';
import PdfUpload from '../components/PdfUpload';
import { ARTICLE_CATEGORIES } from '../constants';
import { submitArticle } from '../api/communityApi';

export default function SubmitArticlePage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0]);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    try {
      const result = await submitArticle({
        title: title.trim(),
        author: author.trim(),
        category,
        summary: summary.trim(),
        content: content.trim(),
        coverImage: coverImage.trim(),
        pdfUrl: pdfUrl.trim(),
      });
      setSuccessId(result.id || '');
      setStatus('success');
      setTitle('');
      setAuthor('');
      setSummary('');
      setContent('');
      setCoverImage('');
      setPdfUrl('');
    } catch (err) {
      setError(err.message || 'Could not submit article.');
      setStatus('error');
    }
  };

  return (
    <div className="community-page community-page--narrow">
      <header className="community-page-header">
        <h1>Submit an article</h1>
        <p className="community-page-desc">
          Share your PM experience with the community. Articles are reviewed by an
          admin before publishing.
        </p>
      </header>

      {status === 'success' ? (
        <div className="community-alert community-alert--success">
          <h2>Submitted for review</h2>
          <p>
            Thank you! Your article has been sent to the admin team.
            {successId && <> Reference: {successId}</>}
          </p>
          <Link to="/community/articles" className="community-btn community-btn--secondary">
            Browse published articles
          </Link>
        </div>
      ) : (
        <form className="community-form" onSubmit={handleSubmit}>
          <label className="community-field">
            <span className="community-field-label">Title</span>
            <input
              className="community-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </label>

          <label className="community-field">
            <span className="community-field-label">Your name</span>
            <input
              className="community-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              maxLength={80}
            />
          </label>

          <label className="community-field">
            <span className="community-field-label">Category</span>
            <select
              className="community-select community-select--full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {ARTICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="community-field">
            <span className="community-field-label">Short summary</span>
            <input
              className="community-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={200}
              placeholder="One sentence preview for the article card"
            />
          </label>

          <ImageUpload value={coverImage} onChange={setCoverImage} />

          <PdfUpload value={pdfUrl} onChange={setPdfUrl} />

          <RichTextEditor
            id="article-content"
            label="Article content"
            value={content}
            onChange={setContent}
            placeholder="Write your article here…"
          />

          {error && <p className="community-alert community-alert--error">{error}</p>}

          <button
            type="submit"
            className="community-btn community-btn--primary"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      )}
    </div>
  );
}
