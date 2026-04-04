// app/admin/course/[id]/_components/AssessmentRow.js
"use client";

import { useState, useTransition } from "react";
import { updateAssessment } from "@/app/actions/assessment";
import DeleteAssessmentButton from "./DeleteAssessmentButton";

export default function AssessmentRow({ assessment, courseId, month, day }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Append the IDs securely
    formData.append("assessmentId", assessment.id);
    formData.append("courseId", courseId);

    startTransition(async () => {
      const result = await updateAssessment(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        // Turn off edit mode on success!
        setIsEditing(false);
      }
    });
  };

  // --------------------------------------------------------
  // EDIT MODE: Renders the inline form
  // --------------------------------------------------------
  if (isEditing) {
    return (
      <form 
        onSubmit={handleSave} 
        className="assessment-item" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '2px solid #3498db', borderRadius: '8px', marginBottom: '10px', background: '#f8f9fa' }}
      >
        <div style={{ display: 'flex', gap: '10px', flexGrow: 1, marginRight: '20px' }}>
          <input type="text" name="title" className="form-control" defaultValue={assessment.title} required style={{ flex: 2 }} />
          <input type="number" name="weight" className="form-control" defaultValue={assessment.weight} required min="1" max="100" style={{ flex: 1 }} />
          <select name="type" className="form-control" defaultValue={assessment.type} required style={{ flex: 1 }}>
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
            <option value="Lab">Lab</option>
            <option value="Project">Project</option>
            <option value="Exam">Exam</option>
          </select>
          <input type="date" name="date" className="form-control" defaultValue={assessment.date} required style={{ flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
            {isPending ? "..." : "Save"}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm" disabled={isPending}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // --------------------------------------------------------
  // VIEW MODE: Renders the standard text row
  // --------------------------------------------------------
  return (
    <div className="assessment-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '10px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="assessment-date" style={{ textAlign: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '5px', minWidth: '60px' }}>
          <span className="month" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>{month}</span>
          <span className="day" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{day}</span>
        </div>

        <div className="assessment-details">
          <h5 className="assessment-title" style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{assessment.title}</h5>
          <p className="assessment-type" style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{assessment.type}</p>
          <span className="assessment-course" style={{ display: 'block', marginTop: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
            Weight: {assessment.weight}%
          </span>
        </div>
      </div>

      <div className="nav-links" style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">Edit</button>
        <DeleteAssessmentButton assessmentId={assessment.id} courseId={courseId} />
      </div>
    </div>
  );
}