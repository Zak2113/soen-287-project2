// app/student/_components/CourseGradesCard.js
import GradeItem from './GradeItem';

export default function CourseGradesCard({ code, term, title, instructor, progress, completed, incomplete }) {
  return (
    <div className="course-card">
      <div className="course-card-header">
        <span className="course-code">{code}</span>
        <span className="course-term">{term}</span>
      </div>
      <h4 className="course-title">{title}</h4>
      <p className="course-instructor">{instructor}</p>

      <div className="course-progress">
        <div className="progress-info">
          <span>Progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Completed Section */}
      <hr className="grades-divider" />
      <h5 className="grades-subtitle">Completed Assessments</h5>
      <div className="assessment-list">
        {completed.map((item) => (
          <GradeItem 
            key={item.id}
            title={item.title}
            weight={item.weight}
            earned={item.earned}
            total={item.total}
            isGraded={true} 
          />
        ))}
      </div>

      {/* Incomplete Section */}
      <hr className="grades-divider" />
      <h5 className="grades-subtitle">Incomplete Assessments</h5>
      <div className="assessment-list">
        {incomplete.map((item) => (
          <GradeItem 
            key={item.id}
            title={item.title}
            weight={item.weight}
            total={100} 
            isGraded={false} 
          />
        ))}
      </div>
    </div>
  );
}