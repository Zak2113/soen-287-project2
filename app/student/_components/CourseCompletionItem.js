// app/student/_components/CourseCompletionItem.js

export default function CourseCompletionItem({ title, progress }) {
  return (
    <div className="assessment-item">
      <div className="assessment-details" style={{ width: '100%' }}>
        <h5 className="assessment-title">{title}</h5>
        <span className="assessment-course">Assessments Completed</span>
        <div className="course-progress">
          <div className="progress-info">
            <strong>{progress}%</strong>
          </div>
          <div className="progress-bar">
            {/* The dynamic inline width requirement */}
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}