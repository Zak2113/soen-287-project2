// app/student/page.js
import Link from 'next/link';
import CourseCard from './_components/CourseCard';
import AssessmentItem from './_components/AssessmentItem';

export default function StudentDashboard() {

  // 1. SIMULATED DATABASE DATA
  // In the future, this will be replaced with: const courses = await db.getCourses(userId);
  const currentUser = {
    firstName: "Student",
    role: "student"
  };

  const myCourses = [
    { id: 1, code: "SOEN 287", term: "Winter 2026", title: "Web Development", instructor: "Prof. Mohammad Bashar", progress: 55 },
    { id: 2, code: "COMP 233", term: "Winter 2026", title: "Probability & Statistics", instructor: "Prof. Thomas Fevens", progress: 56 },
    // You can add a third one here just to see it automatically appear!
    { id: 3, code: "ENCS 282", term: "Winter 2026", title: "Technical Writing", instructor: "Prof. Jane Doe", progress: 12 } ,
    
  ];

  const myDeadlines = [
    { id: 101, month: "FEB", day: "23", title: "Problem Set 3", course: "COMP 233", status: "Late", isLate: true },
    { id: 102, month: "FEB", day: "27", title: "SOEN 287 Project - Deliverable 1", course: "SOEN 287", status: "Due Soon", isLate: false }
  ];

  return (
    <>
    <div className="content-area">
      <div className="dashboard-header">
        {/* 2. THE DYNAMIC INJECTION */}
        {/* We use curly braces to inject the firstName property */}
        <h2>Welcome back, {currentUser.firstName}!</h2>
        <p>You have {myDeadlines.length} upcoming assignments due this week.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: My Courses Grid */}
        <section className="courses-section">
          <div className="section-header">
            <h3>Enrolled Courses</h3>
            <Link href="/student/add-course" className="btn btn-outline btn-sm">Add Course</Link>
          </div>
          
          <div className="course-cards">
            {/* 2. THE MAGIC LOOP */}
            {/* We map over the array and return a CourseCard for every object */}
            {myCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                courseCode={course.code} 
                term={course.term} 
                title={course.title} 
                instructor={course.instructor} 
                progress={course.progress} 
              />
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: Upcoming Assessments List */}
        <section className="assessments-section">
          <div className="section-header">
            <h3>Upcoming Deadlines</h3>
            <Link href="/student/calendar" className="btn btn-outline btn-sm">Calendar</Link>
          </div>
          
          <div className="assessment-list">
            {/* 3. MAPPING THE DEADLINES */}
            {myDeadlines.map((item) => (
              <AssessmentItem 
                key={item.id}
                month={item.month} 
                day={item.day} 
                title={item.title} 
                course={item.course} 
                status={item.status} 
                isLate={item.isLate} 
              />
            ))}
          </div>
        </section>

      </div>
      </div>
    </>
  );
}