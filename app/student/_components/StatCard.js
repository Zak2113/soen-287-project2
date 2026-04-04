// app/student/_components/StatCard.js

export default function StatCard({ title, subtitle, value }) {
  return (
    <div className="course-card">
      <h4 className="course-title">{title}</h4>
      <p className="course-instructor">{subtitle}</p>
      <strong style={{ fontSize: '2rem' }}>{value}</strong>
    </div>
  );
}