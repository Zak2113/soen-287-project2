// app/student/_components/CourseCard.js
import Link from 'next/link';
import styles from './CourseCard.module.css'

export default function CourseCard({ courseCode, term, title, instructor, progress }) {
    return (
        <div className={styles["course-card"]}>
            <div className={styles["course-card-header"]}>
                <span className={styles["course-code"]}>{courseCode}</span>
                <span className={styles["course-term"]}>{term}</span>
            </div>
            <h4 className={styles["course-title"]}>{title}</h4>
            <p className={styles["course-instructor"]}>{instructor}</p>

            <div className={styles["course-progress"]}>
                <div className={styles["progress-info"]}>
                    <span>Completion</span>
                    <strong>{progress}%</strong>
                </div>
                <div className={styles["progress-bar"]}>
                    {/* React requires inline styles to be objects */}
                    <div
                        className={styles['progress-fill']}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <Link href="/student/course" className="btn btn-outline btn-block">
                View Course
            </Link>
        </div>
    );
}