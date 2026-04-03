// app/student/_components/AssessmentItem.js

import styles from './AssessmentItem.module.css'

export default function AssessmentItem({ month, day, title, course, status, isLate }) {
  // Dynamically set the color class based on whether it's late or due soon
  const badgeClass = isLate ? "status-pending" : "status-due-soon";

  return (
    <div className={styles["assessment-item"]}>
      <div className={styles["assessment-date"]}>
        <span className={styles["month"]}>{month}</span>
        <span className={styles["day"]}>{day}</span>
      </div>
      <div className={styles["assessment-details"]}>
        <h5 className={styles["assessment-title"]}>{title}</h5>
        <span className={styles["assessment-course"]}>{course}</span>
      </div>
      <span className={`${styles['status-badge']} ${styles[badgeClass]}`}>
        {status}
      </span>
    </div>
  );
}