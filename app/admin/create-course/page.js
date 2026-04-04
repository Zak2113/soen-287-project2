// app/admin/create-course/page.js
"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/actions/course";

export default function CreateCoursePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State for errors
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  // Safely extract the admin's name
  const instructorName = session?.user 
    ? `${session.user.firstName} ${session.user.lastName}` 
    : "Loading...";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors on new submission
    setGeneralError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCourse(formData);
      
      if (result?.success && result?.courseId) {
        // Success! Send them directly to the new course's management page
        router.push(`/admin/course/${result.courseId}`);
      } else if (result?.errors) {
        // Catch Zod validation errors (e.g., Course Code regex failed)
        setFieldErrors(result.errors);
        setGeneralError("Validation failed. Please check the requirements above.");
      } else {
        // Catch database or authentication errors
        setGeneralError(result?.error || result?.message || "Failed to create course.");
      }
    });
  };

  return (
    <>
      <div className="dashboard-header">
        <h2>Create a Course</h2>
        <p>Set up a new class section for the upcoming term.</p>
      </div>

      <div className="dashboard-form">
        <div className="add-course-card">
          
          {/* General Error Alert */}
          {generalError && (
            <div className="alert alert-error" style={{ color: 'white', background: '#e74c3c', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
              <strong>{generalError}</strong>
              
              {/* Display specific Zod field errors as a bulleted list */}
              {Object.keys(fieldErrors).length > 0 && (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {Object.entries(fieldErrors).map(([field, errors]) => (
                    <li key={field}>{errors[0]}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="instructor" className="form-label">Instructor</label>
              <input 
                type="text" 
                id="instructor" 
                className="form-control" 
                value={instructorName} 
                disabled 
              />
            </div>

            <div className="form-group">
              <label htmlFor="term" className="form-label">Term</label>
              {/* Values are strictly mapped to the Zod Enum */}
              <select id="term" name="term" className="form-control" required defaultValue="">
                <option value="" disabled>Select a term...</option>
                <option value="F">Fall (F)</option>
                <option value="W">Winter (W)</option>
                <option value="FW">Fall/Winter (FW)</option>
                <option value="S">Summer Full (S)</option>
                <option value="S1">Summer 1 (S1)</option>
                <option value="S2">Summer 2 (S2)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="courseCode" className="form-label">Course Code</label>
              <input 
                type="text" 
                id="courseCode" 
                name="courseCode" 
                className="form-control" 
                placeholder="e.g., SOEN 287" 
                required 
              />
              <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                Must be 3-4 letters followed by 3-4 numbers.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="courseName" className="form-label">Course Name</label>
              <input 
                type="text" 
                id="courseName" 
                name="courseName" 
                className="form-control" 
                placeholder="e.g., Web Programming" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="courseDescription" className="form-label">Course Description</label>
              <textarea 
                id="courseDescription" 
                name="courseDescription" 
                className="form-control" 
                placeholder="Brief overview of the curriculum..." 
                rows="3"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isPending} 
              style={{ marginTop: '1rem' }}
            >
              {isPending ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}