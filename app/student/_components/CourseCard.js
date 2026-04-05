// app/student/_components/CourseCard.js
import Link from 'next/link';
import styles from './CourseCard.module.css'

export default function CourseCard({ id, courseCode, term, title, instructor, progress }) {
    return (
        <div className="course-card">
            <div className="course-card-header">
                <span className="course-code">{courseCode}</span>
                <span className="course-term">{term}</span>
            </div>
            <h4 className="course-title">{title}</h4>
            <p className="course-instructor">{instructor}</p>

            <div className="course-progress">
                <div className="progress-info">
                    <span>Completion</span>
                    <strong>{progress}%</strong>
                </div>
                <div className="progress-bar">
                    {/* React requires inline styles to be objects */}
                    <div
                        className='progress-fill'
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <Link href={`/student/courses/${id}`} className="btn btn-outline btn-block">
                View Course
            </Link>
        </div>
    );
}