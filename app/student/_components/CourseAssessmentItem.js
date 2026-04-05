"use client";

import { useState, useTransition } from "react";
import { submitAssessmentScore } from "@/app/actions/student-grade";

export default function CourseAssessmentItem({ assessmentId, courseId, title, weight, status, earned, total }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(earned === null || earned === undefined);
  const isCompleted = earned !== null && earned !== undefined;
  
  const displayStatus = isCompleted ? "Completed" : status;
  const badgeClass = isCompleted ? "status-graded" : "status-due-soon";

  const handleSaveMark = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitAssessmentScore(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        // Switch back to view mode, but only if they didn't clear the grade!
        // If they cleared it, we want it to stay an open input box.
        const submittedScore = formData.get("earned");
        if (submittedScore !== "") {
          setIsEditing(false);
        }
      }
    });
  };

  return (
    <div className="assessment-item">
      <div className="assessment-details">
        <h5 className="assessment-title">{title}</h5>
        <span className="assessment-course">Weight: {weight}%</span>
      </div>
      
      {!isEditing && isCompleted ? (
        <div className="assessment-grade">
          <strong>{earned} / {total}</strong>
          <span>{Math.round((earned / total) * 100)}%</span>
        </div>
      ) : (
        <form className="nav-links" onSubmit={handleSaveMark}>
          
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="courseId" value={courseId} />

          {/* 🚨 THE FIX: Removed the 'required' tag so they can submit a blank box 🚨 */}
          <input 
            type="number" 
            name="earned"
            className="form-control" 
            placeholder={`Score / ${total}`} 
            style={{ width: '110px' }} 
            min="0"
            max={total}
            defaultValue={isCompleted ? earned : ""}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </button>
          
          {isCompleted && (
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
          )}
        </form>
      )}

      <div className="nav-links">
        {!isEditing && isCompleted && (
          <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
            Edit
          </button>
        )}
        <span className={`status-badge ${badgeClass}`}>{displayStatus}</span>
      </div>
    </div>
  );
}