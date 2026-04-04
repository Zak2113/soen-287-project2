// app/admin/course/[id]/_components/CreateAssessmentForm.js
"use client";

import { useState, useTransition } from "react";
import { createAssessment } from "@/app/actions/assessment";

export default function CreateAssessmentForm({ courseId }) {
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    // Append the courseId so the server knows where to put it
    formData.append("courseId", courseId);

    startTransition(async () => {
      const result = await createAssessment(formData);
      
      if (result?.success) {
        // Clear the form on success
        e.target.reset(); 
      } else if (result?.errors) {
        setFieldErrors(result.errors);
        setGeneralError("Please check the form for errors.");
      } else {
        setGeneralError(result?.error || "Failed to create assessment.");
      }
    });
  };

  return (
    <section className="profile-section" style={{ marginTop: '2rem' }}>
      <div className="section-header">
        <h3>Define Assessment Structure</h3>
      </div>

      {generalError && (
        <div style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '0.9rem' }}>
          <strong>{generalError}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="nav-links" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <div style={{ flex: 2 }}>
          <input type="text" name="title" className="form-control" placeholder="Assessment Name (e.g. Midterm)" required />
          {fieldErrors.title && <small style={{ color: '#e74c3c' }}>{fieldErrors.title[0]}</small>}
        </div>

        <div style={{ flex: 1 }}>
          <input type="number" name="weight" className="form-control" placeholder="Weight (%)" required min="1" max="100" />
          {fieldErrors.weight && <small style={{ color: '#e74c3c' }}>{fieldErrors.weight[0]}</small>}
        </div>

        <div style={{ flex: 1 }}>
          <select name="type" className="form-control" required defaultValue="">
            <option value="" disabled hidden>Type</option>
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
            <option value="Lab">Lab</option>
            <option value="Project">Project</option>
            <option value="Exam">Exam</option>
          </select>
          {fieldErrors.type && <small style={{ color: '#e74c3c' }}>{fieldErrors.type[0]}</small>}
        </div>

        <div style={{ flex: 1 }}>
          <input type="date" name="date" className="form-control" required />
          {fieldErrors.date && <small style={{ color: '#e74c3c' }}>{fieldErrors.date[0]}</small>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "..." : "Add"}
        </button>
      </form>
    </section>
  );
}