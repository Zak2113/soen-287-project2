// app/student/analytics/page.js
import StatCard from '../_components/StatCard';
import CourseCompletionItem from '../_components/CourseCompletionItem';

export default function AnalyticsDashboard() {
  
  // MOCK DATA ARRAYS
  const gradeMetrics = [
    { id: 1, title: "Current GPA", subtitle: "Projected From Current Grades", value: "3.8" },
    { id: 2, title: "Current Grade As Percentage", subtitle: "Projected From Current Grades", value: "85%" },
    { id: 3, title: "Current Grade As Letter", subtitle: "Projected From Current Grades", value: "B+" }
  ];

  const completionRates = [
    { id: 101, title: "SOEN 287S Web Development", progress: 55 },
    { id: 102, title: "Probability & Statistics", progress: 54 }
  ];

  const assessmentMetrics = [
    { id: 201, title: "Upcoming Assessments", subtitle: "Assessments You Need To Complete", value: "3" },
    { id: 202, title: "Assessments Completed", subtitle: "Total Assessments you have completed", value: "5" },
    { id: 203, title: "Overdue Assessments", subtitle: "Assessments You Have Missed", value: "2" }
  ];

  return (
    <>
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
      </div>

      {/* 1. Grade Overview Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Grade Overview</h3>
        </div>
        <div className="course-cards">
          {gradeMetrics.map((metric) => (
            <StatCard 
              key={metric.id}
              title={metric.title}
              subtitle={metric.subtitle}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      {/* 2. Course Completion Rates Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Course Completion Rates</h3>
        </div>
        <div className="assessment-list">
          {completionRates.map((course) => (
            <CourseCompletionItem 
              key={course.id}
              title={course.title}
              progress={course.progress}
            />
          ))}
        </div>
      </section>

      {/* 3. Assessments Overview Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Assessments Overview</h3>
        </div>
        <div className="course-cards">
          {assessmentMetrics.map((metric) => (
            <StatCard 
              key={metric.id}
              title={metric.title}
              subtitle={metric.subtitle}
              value={metric.value}
            />
          ))}
        </div>
      </section>
    </>
  );
}