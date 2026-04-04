// app/student/grades/page.js
import CourseGradesCard from '../_components/CourseGradesCard';

export default function GradesPage() {
  
  // MOCK DATABASE DATA
  const myGradesData = [
    {
      id: 1,
      code: "SOEN 287 S",
      term: "Winter 2026",
      title: "Web Development",
      instructor: "Prof. Mohammad Bashar",
      progress: 55,
      completed: [
        { id: 101, title: "Course Project - Deliverable 1", weight: 10, earned: 95, total: 100 },
        { id: 102, title: "Midterm Exam", weight: 30, earned: 91, total: 100 }
      ],
      incomplete: [
        { id: 103, title: "Course Project - Deliverable 2", weight: 10 },
        { id: 104, title: "Final Exam", weight: 50 }
      ]
    },
    {
      id: 2,
      code: "COMP 233 S",
      term: "Winter 2026",
      title: "Probability & Statistics",
      instructor: "Prof. Thomas Fevens",
      progress: 56,
      completed: [
        { id: 201, title: "Assignment 1", weight: 2.5, earned: 95, total: 100 },
        { id: 202, title: "Assignment 2", weight: 2.5, earned: 65, total: 100 },
        { id: 203, title: "Midterm Exam", weight: 30, earned: 91, total: 100 }
      ],
      incomplete: [
        { id: 204, title: "Assignment 3", weight: 2.5 },
        { id: 205, title: "Assignment 4", weight: 2.5 },
        { id: 206, title: "Final Exam", weight: 60 }
      ]
    }
  ];

  return (
    <>
      <div className="dashboard-header">
        <h2>My Grades</h2>
        <p>Review your completed assessments and current standing across all enrolled courses.</p>
      </div>

      <div className="grades-container">
        {/* Iterate over our database array and render a card for each course */}
        {myGradesData.map((course) => (
          <CourseGradesCard
            key={course.id}
            code={course.code}
            term={course.term}
            title={course.title}
            instructor={course.instructor}
            progress={course.progress}
            completed={course.completed}
            incomplete={course.incomplete}
          />
        ))}
      </div>
    </>
  );
}