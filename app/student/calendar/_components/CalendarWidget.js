"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalendarWidget({ assessments }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groupedAssessments = {};
  assessments.forEach((assessment) => {
    if (!assessment.date) return;
    if (!groupedAssessments[assessment.date]) {
      groupedAssessments[assessment.date] = [];
    }
    groupedAssessments[assessment.date].push(assessment);
  });

  // Uses your --bg-light variable for empty calendar days
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <div key={`blank-${i}`} style={{ backgroundColor: 'var(--bg-light)', borderRadius: '6px', minHeight: '120px' }}></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayAssessments = groupedAssessments[dateString] || [];

    return (
      <div 
        key={dayNum} 
        style={{ 
          backgroundColor: 'var(--surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '6px', 
          minHeight: '120px', 
          padding: '10px', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {dayNum}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {dayAssessments.map((a) => {
            const isCompleted = a.earned !== null && a.earned !== undefined;
            const assessmentDate = new Date(a.date);
            assessmentDate.setDate(assessmentDate.getDate() + 1); 
            assessmentDate.setHours(0, 0, 0, 0);
            
            const isOverdue = !isCompleted && assessmentDate < today;

            // 🚨 Relying entirely on YOUR existing status classes 🚨
            let statusClass = "status-due-soon";
            let statusText = "Upcoming";
            
            if (isCompleted) {
              statusClass = "status-graded";
              statusText = "Done";
            } else if (isOverdue) {
              statusClass = "status-pending";
              statusText = "Overdue";
            }

            return (
              <Link 
                key={a.id} 
                href={`/student/courses/${a.courseId}`} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  padding: '8px', 
                  backgroundColor: 'var(--bg-light)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Reusing your .course-code class */}
                  <span className="course-code" style={{ fontSize: '0.65rem', padding: '2px 4px' }}>
                    {a.courseCode}
                  </span>
                  {/* Reusing your .status-badge classes */}
                  <span className={`status-badge ${statusClass}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {statusText}
                  </span>
                </div>
                {/* Reusing your .assessment-title class */}
                <span className="assessment-title" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                  {a.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    );
  });

  return (
    /* Wraps the entire calendar in your existing profile-section styling */
    <div className="profile-section">
      
      <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <button onClick={prevMonth} className="btn btn-outline btn-sm">
          &larr; Prev
        </button>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-blue)' }}>
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="btn btn-outline btn-sm">
          Next &rarr;
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px', marginTop: '1rem' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Grid layouts accept inline styling natively without breaking dark mode */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {blanks}
        {days}
      </div>

    </div>
  );
}