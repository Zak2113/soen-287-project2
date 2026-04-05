// app/student/calendar/_components/CalendarWidget.js
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

  // Get midnight today so we can accurately check if something is overdue
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

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <div key={`blank-${i}`} style={{ background: '#f8f9fa', borderRadius: '4px', minHeight: '120px' }}></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayAssessments = groupedAssessments[dateString] || [];

    return (
      <div 
        key={dayNum} 
        style={{ border: '1px solid #eaeaea', borderRadius: '4px', minHeight: '120px', padding: '10px', background: '#fff', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>
          {dayNum}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1 }}>
          {dayAssessments.map((a) => {
            
            // 🚨 THE COLOR LOGIC 🚨
            const isCompleted = a.earned !== null && a.earned !== undefined;
            const assessmentDate = new Date(a.date);
            // We have to add a day to the parsed date to fix timezone offset issues
            assessmentDate.setDate(assessmentDate.getDate() + 1); 
            assessmentDate.setHours(0, 0, 0, 0);
            
            const isOverdue = !isCompleted && assessmentDate < today;

            // Default Blue (Upcoming)
            let bg = '#e8f4fd', text = '#2980b9', border = '#3498db'; 
            
            if (isCompleted) {
              // Green (Submitted/Done)
              bg = '#eafaf1'; text = '#27ae60'; border = '#2ecc71'; 
            } else if (isOverdue) {
              // Red (Missed Deadline!)
              bg = '#fdedec'; text = '#c0392b'; border = '#e74c3c'; 
            }

            return (
              <Link 
                key={a.id} 
                href={`/student/courses/${a.courseId}`} 
                style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  padding: '6px', 
                  background: bg,        // Dynamic
                  color: text,           // Dynamic
                  borderLeft: `3px solid ${border}`, // Dynamic
                  borderRadius: '4px', 
                  textDecoration: 'none', 
                  lineHeight: '1.2'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '2px' }}>{a.courseCode}</strong>
                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #eaeaea' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={prevMonth} className="btn btn-outline btn-sm">
          &larr; Previous
        </button>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="btn btn-outline btn-sm">
          Next &rarr;
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {blanks}
        {days}
      </div>

    </div>
  );
}