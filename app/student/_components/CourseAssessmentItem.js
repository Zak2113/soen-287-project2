// app/student/_components/CourseAssessmentItem.js
"use client"; // Required because this component has a form submission

export default function CourseAssessmentItem({ title, weight, status, earned, total }) {
  
  // Prevent page reload on form submit
  const handleSaveMark = (e) => {
    e.preventDefault();
    console.log(`Saving marks for ${title}`);
  };

  const isCompleted = status === "Completed";
  const badgeClass = isCompleted ? "status-graded" : "status-due-soon";

  return (
    <div className="assessment-item">
      <div className="assessment-details">
        <h5 className="assessment-title">{title}</h5>
        <span className="assessment-course">Weight: {weight}%</span>
      </div>
      
      {/* CONDITIONAL RENDERING: Show grade if completed, else show input form */}
      {isCompleted ? (
        <div className="assessment-grade">
          <strong>{earned} / {total}</strong>
          <span>{Math.round((earned / total) * 100)}%</span>
        </div>
      ) : (
        <form className="nav-links" onSubmit={handleSaveMark}>
          <input type="number" className="form-control" placeholder="Mark" style={{ width: '90px' }} required />
          <input type="number" className="form-control" placeholder="Total" style={{ width: '90px' }} required />
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
        </form>
      )}

      {/* Actions */}
      <div className="nav-links">
        {isCompleted && <button className="btn btn-outline btn-sm">Edit</button>}
        <button className="btn btn-outline btn-sm">Delete</button>
        <span className={`status-badge ${badgeClass}`}>{status}</span>
      </div>
    </div>
  );
}