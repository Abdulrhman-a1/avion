import { useEffect, useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard';
import SearchFilter from '../components/SearchFilter';
import { SkeletonGrid } from '../components/SkeletonCard';
import { COURSE_CATEGORIES } from '../constants';
import { fetchCourses } from '../api/communityApi';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCourses({ category, q: query })
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading…';
    return `${courses.length} guide${courses.length === 1 ? '' : 's'}`;
  }, [courses.length, loading]);

  return (
    <div className="community-page">
      <header className="community-page-header">
        <h1>Courses & guides</h1>
        <p className="community-page-desc">
          Structured learning paths for planning, communication, risk, and competition
          deliverables.
        </p>
      </header>

      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={COURSE_CATEGORIES}
        placeholder="Search guides…"
      />

      <p className="community-count">{countLabel}</p>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : courses.length === 0 ? (
        <p className="community-muted">No guides match your filters.</p>
      ) : (
        <div className="community-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
