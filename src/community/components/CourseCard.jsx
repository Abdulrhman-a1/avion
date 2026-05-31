import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Project Planning': '🗂️',
  'Gantt Charts': '📊',
  'Risk Management': '⚠️',
  'Team Management': '👥',
  'Deliverables': '📦',
  'Communication': '💬',
  'Budget': '💰',
  'Stakeholders': '🤝',
};

export default function CourseCard({ course }) {
  const icon = CATEGORY_ICONS[course.category] || '📋';

  return (
    <article className="community-card course-card">
      <div className="course-card-icon" aria-hidden="true">{icon}</div>
      <span className="community-chip community-chip--blue">{course.category}</span>
      <h3 className="community-card-title">
        <Link to={`/community/courses/${course.id}`}>{course.title}</Link>
      </h3>
      <p className="community-card-desc">{course.summary}</p>
      <Link to={`/community/courses/${course.id}`} className="community-card-link">
        Open guide →
      </Link>
    </article>
  );
}
