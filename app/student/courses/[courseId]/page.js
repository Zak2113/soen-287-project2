// app/student/courses/[courseId]/page.js
import Link from 'next/link';
import CourseAssessmentItem from '../../_components/CourseAssessmentItem';

export default async function CourseDetail({ params }) {
  const { courseId } = await params;

  // MOCK DATA
  const courseDetails = {
    code: "SOEN 287",
    title: "Web Development",
    instructor: "Prof. Mohammad Bashar",
    currentAverage: 88,
  };

  const assessments = [
    { id: 1, title: "Firewall Configuration Lab", weight: 20, status: "Pending" },
    { id: 2, title: "Cryptography Quiz", weight: 10, status: "Completed", earned: 90, total: 100 },
    { id: 3, title: "Final Project Proposal", weight: 15, status: "Pending" }
  ];

  return (
    <div>
      {/* Navigation Back Button */}
      <div className="form-group">
        <Link href="/student" className="login-link">&larr; Back to Dashboard</Link>
      </div>

      {/* Course Header & Actions - Relying entirely on your flex-between class */}
      <div className="dashboard-header flex-between">
        <div>
          <h2>{courseDetails.title} <span className="course-code">{courseDetails.code}</span></h2>
          <p>{courseDetails.instructor}</p>
        </div>
        <div className="action-group">
          <button className="btn btn-primary btn-sm"><Link href={`/student/courses/${courseId}/edit`}>
            Edit Course
          </Link></button>
          <button className="btn btn-primary btn-sm">Hide Course</button>
        </div>
      </div>

      {/* Course Progress Summary */}
      <section className="profile-section">
        <div className="course-progress">
          <div className="progress-info">
            <span>Current Overall Average</span>
            <strong>{courseDetails.currentAverage}%</strong>
          </div>
          <div className="progress-bar">
            {/* This is the ONLY inline style that must stay, as it requires live JS data */}
            <div className="progress-fill" style={{ width: `${courseDetails.currentAverage}%` }}></div>
          </div>
        </div>
      </section>

      {/* Assessments Header */}
      <div className="section-header">
        <h3>Course Assessments</h3>
        <button className="btn btn-primary btn-sm">Add Assessment</button>
      </div>

      {/* Assessments List */}
      <div className="assessment-list">
        {assessments.map((item) => (
          <CourseAssessmentItem 
            key={item.id}
            title={item.title}
            weight={item.weight}
            status={item.status}
            earned={item.earned}
            total={item.total}
          />
        ))}
      </div>
    </div>
  );
}