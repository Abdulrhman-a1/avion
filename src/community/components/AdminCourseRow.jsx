export default function AdminCourseRow({ course, onEdit, onDelete, busy }) {
  return (
    <tr className="admin-row">
      <td>
        <strong>{course.title}</strong>
        <p className="admin-row-meta">{course.category} · Order {course.order}</p>
      </td>
      <td>{course.summary}</td>
      <td className="admin-row-actions admin-row-actions--inline">
        <button
          type="button"
          className="community-btn community-btn--secondary"
          disabled={busy}
          onClick={() => onEdit(course)}
        >
          Edit
        </button>
        <button
          type="button"
          className="community-btn community-btn--ghost"
          disabled={busy}
          onClick={() => onDelete(course.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
