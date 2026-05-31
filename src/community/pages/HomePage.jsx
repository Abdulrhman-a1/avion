import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import CourseCard from '../components/CourseCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { fetchArticles, fetchCourses } from '../api/communityApi';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [articleData, courseData] = await Promise.all([
          fetchArticles(),
          fetchCourses(),
        ]);
        if (!cancelled) {
          setArticles(articleData.slice(0, 3));
          setCourses(courseData.slice(0, 3));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="community-page">
      <section className="community-hero">
        <p className="community-eyebrow">STEM Racing · Project Management</p>
        <h1 className="community-hero-title">
          Learn, improve, and share PM knowledge
        </h1>
        <p className="community-hero-desc">
          A professional hub for STEM Racing project managers — articles from the
          community, structured guides, and practical competition preparation.
        </p>
        <div className="community-hero-actions">
          <Link to="/community/articles" className="community-btn community-btn--primary">
            Browse articles
          </Link>
          <Link to="/community/courses" className="community-btn community-btn--secondary">
            Explore courses
          </Link>
        </div>
      </section>

      <section className="community-section">
        <div className="community-section-head">
          <h2>Latest articles</h2>
          <Link to="/community/articles">View all</Link>
        </div>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="community-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      <section className="community-section">
        <div className="community-section-head">
          <h2>Featured guides</h2>
          <Link to="/community/courses">View all</Link>
        </div>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : (
          <div className="community-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="community-cta">
        <h2>Share your experience</h2>
        <p>Submit an article for admin review and help other PMs on their journey.</p>
        <Link to="/community/submit" className="community-btn community-btn--primary">
          Submit an article
        </Link>
      </section>
    </div>
  );
}
