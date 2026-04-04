// app/admin/_components/ToggleCourseButton.js
"use client";

import { useTransition } from "react";
import { toggleCourseStatus } from "@/app/actions/course";

export default function ToggleCourseButton({ courseId, isActive }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCourseStatus(courseId, isActive);
    });
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={isPending} 
      className="btn btn-outline btn-sm"
    >
      {isPending 
        ? "Updating..." 
        : isActive ? "Disable Course" : "Enable Course"}
    </button>
  );
}