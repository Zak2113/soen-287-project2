// app/student/add-course/_components/EnrollButton.js
"use client";

import { useTransition } from "react";
import { enrollInCourse } from "@/app/actions/enrollment";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleEnroll = () => {
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      
      if (result?.error) {
        alert(result?.error);
      } else {
        // Boom. Instantly send them to their dashboard upon success.
        router.push("/student");
      }
    });
  };

  return (
    <button 
      onClick={handleEnroll} 
      disabled={isPending} 
      className="btn btn-primary"
      style={{ width: '100%' }}
    >
      {isPending ? "Enrolling..." : "Enroll Now"}
    </button>
  );
}