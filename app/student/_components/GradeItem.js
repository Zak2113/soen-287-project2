// app/student/_components/GradeItem.js

export default function GradeItem({ title, weight, earned, total = 100, isGraded }) {
  // Conditionally set the badge styles and text based on grading status
  const badgeClass = isGraded ? "status-graded" : "status-due-soon";
  const badgeText = isGraded ? "Graded" : "Ungraded";

  const displayEarned = isGraded ? earned : "--";
  const displayPercentage = isGraded ? Math.round((earned / total) * 100) : "--";

  return (
    <div className="assessment-item">
      <div className="assessment-details">
        <h5 className="assessment-title">{title}</h5>
        <span className="assessment-course">Weight: {weight}%</span>
      </div>
      <div className="assessment-grade">
        <strong>{displayEarned} / {total}</strong>
        <span>{displayPercentage}%</span>
      </div>
      <span className={`status-badge ${badgeClass}`}>{badgeText}</span>
    </div>
  );
}