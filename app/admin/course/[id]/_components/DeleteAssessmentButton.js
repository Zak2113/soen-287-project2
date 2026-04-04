// app/admin/course/[id]/_components/DeleteAssessmentButton.js
"use client";

import { useTransition } from "react";
import { deleteAssessment } from "@/app/actions/assessment";

export default function DeleteAssessmentButton({ assessmentId, courseId }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    // Add a quick confirmation safeguard
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAssessment(assessmentId, courseId);
      
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending} 
      className="btn btn-outline btn-sm"
      style={{ color: '#e74c3c', borderColor: '#e74c3c', opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}