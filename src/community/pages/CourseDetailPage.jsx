import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownContent from '../components/MarkdownContent';
import { SkeletonDetail } from '../components/SkeletonCard';
import { fetchCourse } from '../api/communityApi';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCourse(id)
      .then((data) => {
        if (!cancelled) setCourse(data);
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

  if (!course) {
    return (
      <div className="community-page">
        <p className="community-muted">Guide not found.</p>
        <Link to="/community/courses" className="community-card-link">
          ← Back to guides
        </Link>
      </div>
    );
  }

  return (
    <div className="community-page">
      <Link to="/community/courses" className="community-back-link">
        ← Back to guides
      </Link>

      <article className="article-detail course-detail">
        <span className="community-chip community-chip--blue">{course.category}</span>
        <h1 className="article-detail-title">{course.title}</h1>
        <p className="article-detail-meta">{course.summary}</p>
        <div className="article-detail-body">
          <MarkdownContent content={course.content} />
        </div>
      </article>
    </div>
  );
}
