import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminArticleRow from '../components/AdminArticleRow';
import AdminCourseRow from '../components/AdminCourseRow';
import AdminArticleForm, { emptyArticle } from '../components/AdminArticleForm';
import AdminArticleReviewPanel from '../components/AdminArticleReviewPanel';
import AdminCourseForm, { emptyCourse } from '../components/AdminCourseForm';
import { SkeletonAdminRows } from '../components/SkeletonCard';
import {
  approveArticle,
  createArticleAdmin,
  createCourseAdmin,
  deleteArticle,
  deleteCourseAdmin,
  fetchAllArticlesAdmin,
  fetchAllCoursesAdmin,
  isAdminLoggedIn,
  rejectArticle,
  setAdminToken,
  updateArticleAdmin,
  updateCourseAdmin,
} from '../api/communityApi';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [articleEditor, setArticleEditor] = useState(null);
  const [courseEditor, setCourseEditor] = useState(null);
  const [articleFilter, setArticleFilter] = useState('pending');
  const [reviewArticle, setReviewArticle] = useState(null);

  const loadArticles = useCallback(async () => {
    const data = await fetchAllArticlesAdmin();
    setArticles(data);
  }, []);

  const loadCourses = useCallback(async () => {
    const data = await fetchAllCoursesAdmin();
    setCourses(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadArticles(), loadCourses()]);
    } catch (err) {
      setError(err.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, [loadArticles, loadCourses]);

  useEffect(() => {
    if (isAdminLoggedIn()) loadAll();
  }, [loadAll]);

  if (!isAdminLoggedIn()) {
    return <Navigate to="/community/admin" replace />;
  }

  const runAction = async (id, action, successMessage) => {
    setBusyId(id || 'form');
    setError('');
    setMessage('');
    try {
      await action();
      await loadAll();
      if (successMessage) setMessage(successMessage);
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setBusyId('');
    }
  };

  const pendingCount = articles.filter((a) => a.status === 'pending').length;
  const filteredArticles = articles.filter((article) => {
    if (articleFilter === 'all') return true;
    return article.status === articleFilter;
  });

  const handleSaveArticle = async (form) => {
    await runAction(
      articleEditor?.id || 'new-article',
      async () => {
        if (articleEditor?.id) {
          await updateArticleAdmin({ id: articleEditor.id, ...form });
        } else {
          await createArticleAdmin(form);
        }
        setArticleEditor(null);
      },
      articleEditor?.id ? 'Article updated.' : 'Article created.',
    );
  };

  const handleSaveCourse = async (form) => {
    await runAction(
      courseEditor?.id || 'new-course',
      async () => {
        if (courseEditor?.id) {
          await updateCourseAdmin({ id: courseEditor.id, ...form });
        } else {
          await createCourseAdmin(form);
        }
        setCourseEditor(null);
      },
      courseEditor?.id ? 'Guide updated.' : 'Guide created.',
    );
  };

  return (
    <div className="community-page">
      <header className="community-page-header community-page-header--row">
        <div>
          <h1>Admin dashboard</h1>
          <p className="community-page-desc">
            Review submitted articles, approve or reject uploads, and manage published content.
            {pendingCount > 0 && ` ${pendingCount} waiting for review.`}
          </p>
        </div>
        <button
          type="button"
          className="community-btn community-btn--ghost"
          onClick={() => {
            setAdminToken('');
            window.location.href = '/community/admin';
          }}
        >
          Sign out
        </button>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab${tab === 'articles' ? ' admin-tab--active' : ''}`}
          onClick={() => {
            setTab('articles');
            setCourseEditor(null);
          }}
        >
          Articles
        </button>
        <button
          type="button"
          className={`admin-tab${tab === 'courses' ? ' admin-tab--active' : ''}`}
          onClick={() => {
            setTab('courses');
            setArticleEditor(null);
          }}
        >
          Courses
        </button>
      </div>

      {message && <p className="community-alert community-alert--success">{message}</p>}
      {error && <p className="community-alert community-alert--error">{error}</p>}

      {tab === 'articles' && (
        <>
          <div className="admin-toolbar admin-toolbar--split">
            <div className="admin-filter-tabs">
              {[
                { id: 'pending', label: `Pending (${pendingCount})` },
                { id: 'approved', label: 'Published' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'all', label: 'All' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-tab${articleFilter === item.id ? ' admin-tab--active' : ''}`}
                  onClick={() => setArticleFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="community-btn community-btn--primary"
              onClick={() => {
                setReviewArticle(null);
                setArticleEditor({ ...emptyArticle, isNew: true });
              }}
            >
              + Add article
            </button>
          </div>

          {reviewArticle && (
            <AdminArticleReviewPanel
              article={reviewArticle}
              busy={busyId === reviewArticle.id}
              onClose={() => setReviewArticle(null)}
              onEdit={(item) => {
                setReviewArticle(null);
                setArticleEditor(item);
              }}
              onApprove={(id) =>
                runAction(id, () => approveArticle(id), 'Article approved and published.').then(
                  () => setReviewArticle(null),
                )
              }
              onReject={(id, reason) =>
                runAction(id, () => rejectArticle(id, reason), 'Article rejected.').then(() =>
                  setReviewArticle(null),
                )
              }
            />
          )}

          {articleEditor && (
            <section className="admin-editor-panel">
              <h2>{articleEditor.id ? 'Edit article' : 'New article'}</h2>
              <AdminArticleForm
                initial={articleEditor.id ? articleEditor : emptyArticle}
                submitLabel={articleEditor.id ? 'Update article' : 'Create article'}
                busy={busyId === (articleEditor.id || 'new-article')}
                onCancel={() => setArticleEditor(null)}
                onSubmit={handleSaveArticle}
              />
            </section>
          )}

          {loading ? (
            <SkeletonAdminRows count={4} />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="community-muted">
                        {articleFilter === 'pending'
                          ? 'No submissions waiting for review.'
                          : 'No articles in this view.'}
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <AdminArticleRow
                        key={article.id}
                        article={article}
                        busy={busyId === article.id}
                        onReview={(item) => {
                          setArticleEditor(null);
                          setReviewArticle(item);
                        }}
                        onEdit={(item) => {
                          setReviewArticle(null);
                          setArticleEditor(item);
                        }}
                        onApprove={(id) =>
                          runAction(id, () => approveArticle(id), 'Article approved.')
                        }
                        onReject={(id, reason) =>
                          runAction(id, () => rejectArticle(id, reason), 'Article rejected.')
                        }
                        onDelete={(id) =>
                          runAction(id, () => deleteArticle(id), 'Article deleted.')
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'courses' && (
        <>
          <div className="admin-toolbar">
            <button
              type="button"
              className="community-btn community-btn--primary"
              onClick={() => setCourseEditor({ ...emptyCourse, isNew: true })}
            >
              + Add guide
            </button>
          </div>

          {courseEditor && (
            <section className="admin-editor-panel">
              <h2>{courseEditor.id ? 'Edit guide' : 'New guide'}</h2>
              <AdminCourseForm
                initial={courseEditor.id ? courseEditor : emptyCourse}
                submitLabel={courseEditor.id ? 'Update guide' : 'Create guide'}
                busy={busyId === (courseEditor.id || 'new-course')}
                onCancel={() => setCourseEditor(null)}
                onSubmit={handleSaveCourse}
              />
            </section>
          )}

          {loading ? (
            <SkeletonAdminRows count={3} />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Guide</th>
                    <th>Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="community-muted">
                        No guides yet. Click &quot;Add guide&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <AdminCourseRow
                        key={course.id}
                        course={course}
                        busy={busyId === course.id}
                        onEdit={(item) => setCourseEditor(item)}
                        onDelete={(id) =>
                          runAction(id, () => deleteCourseAdmin(id), 'Guide deleted.')
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
