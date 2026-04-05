// app/student/_components/AssessmentItem.js

import styles from './AssessmentItem.module.css'

export default function AssessmentItem({ month, day, title, course, status, isLate }) {
  // Dynamically set the color class based on whether it's late or due soon
  const badgeClass = isLate ? "status-pending" : "status-due-soon";

  return (
    <div className="assessment-item">
      <div className="assessment-date">
        <span className="month">{month}</span>
        <span className="day">{day}</span>
      </div>
      <div className="assessment-details">
        <h5 className="assessment-title">{title}</h5>
        <span className="assessment-course">{course}</span>
      </div>
      <span className={`${styles['status-badge']} ${styles[badgeClass]}`}>
        {status}
      </span>
    </div>
  );
}