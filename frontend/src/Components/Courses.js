import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Courses.css";
import axios from "axios";
import { useUser } from "./UserContext";

const Courses = () => {
    const { user } = useUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
   const [enrollingCourse, setEnrollingCourse] = useState(null); // courseTitle or courseId

    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const navigate = useNavigate();

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://localhost/backend/api/fetch-courses.php");
            if (response.data.success) {
                setCourses(response.data.courses);
            } else {
                console.error("Failed to fetch courses");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // Fetch enrolled courses
    const fetchEnrolledCourses = async () => {
        try {
            if (user && user.name) {
                const response = await axios.get(`http://localhost/backend/api/enrolled-courses.php?userName=${user.name}`);
                if (Array.isArray(response.data)) {
                    const enrolledTitles = response.data.map(course => course.title); // Titles of enrolled courses
                    setEnrolledCourses(enrolledTitles);
                } else {
                    console.error("Invalid enrolled courses response:", response.data);
                }
            }
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchCourses();
            await fetchEnrolledCourses();
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleEnroll = async (courseTitle) => {
    if (!user || !user.userId) {
        alert("User ID is missing. Please log in again.");
        return;
    }

    setEnrollingCourse(courseTitle); // 👈 track which course is enrolling

    const requestData = { userId: user.userId, courseTitle };

    try {
        const response = await axios.post(
            "http://localhost/backend/api/enroll-course.php",
            requestData,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success) {
            alert("✅ Enrolled successfully!");
            await fetchEnrolledCourses();
        } else {
            alert(`❌ Enrollment failed: ${response.data.message}`);
        }
    } catch (error) {
        console.error("Enrollment error:", error);
        alert("⚠ An error occurred. Please try again.");
    } finally {
        setEnrollingCourse(null); // ✅ reset
    }
};

    return (
        <div className="container my-2">
            <h2 className="text-center mt-2">Courses</h2>
            {loading ? (
                <div className="text-center">Loading courses...</div>
            ) : (
                <div className="row">
                    {courses.map((course, index) => {
                        const isEnrolled = enrolledCourses.includes(course.title);

                        return (
                            <div key={index} className="col-md-4 mt-4">
                                <div className="card shadow-lg rounded">
                                    <img
                                        src={`http://localhost/backend/api/${course.image}`}
                                        className="card-img-top"
                                        alt={course.title}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{course.title}</h5>
                                        <p className="card-text" style={{ margin: 0, padding: 0 }}>{course.description}</p>
                                    <p style={{ margin: 0, padding: 0 }}>
  Price: {Number(course.price) === 0 ? "Free" : `₹${course.price}`}
</p>

                                         <p style={{ margin: 0, padding: 0 }}>Enrolled Users: {course.enrolledUsers ? course.enrolledUsers.length : 0}</p>
                                             {(() => {
                                            const userEnrollment = course.enrolledUsers?.find(
                                                (entry) =>
                                                    typeof entry === 'object' &&
                                                    (entry.userId === user.userId || entry.userId?.toString() === user.userId)
                                            );

                                            if (userEnrollment && userEnrollment.enrolledAt) {
                                                const enrolledDate = new Date(userEnrollment.enrolledAt);
                                                const expiryDate = new Date(enrolledDate);
                                                expiryDate.setMonth(enrolledDate.getMonth() + 3);

                                                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                                                // Example output: "Jun 2, 2025"

                                                return (
                                                    <>
                                                        {/* <p>Enrolled At: {enrolledDate.toLocaleDateString("en-US", options)}</p> */}
                                                         <p style={{ margin: 0, padding: 0, color: '#d9534f' }}>
                                                            Expires On: {expiryDate.toLocaleDateString("en-US", options)}
                                                        </p>
                                                    </>
                                                );
                                            }

                                            return null;
                                        })()}

                                        <div className="d-flex justify-content-between px-3 mt-3">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    const targetUrl = isEnrolled ? course.enrolledUsersLink : course.notEnrolledUsersLink;
                                                    if (targetUrl) {
                                                        if (targetUrl.startsWith('http')) {
                                                            window.location.href = targetUrl;
                                                        } else {
                                                            navigate(targetUrl);
                                                        }
                                                    } else {
                                                        alert("Course link is not available.");
                                                    }
                                                }}
                                            >
                                                View Course
                                            </button>
{!isEnrolled && (
    <button
        className="btn btn-primary"
        style={{ width: '120px' }}
        onClick={() => {
             if (Number(course.price) === 0) {
                handleEnroll(course.title);
            } else {
                navigate('/payment', {
                    state: {
                        courseId: course._id,
                        title: course.title,
                        price: course.price,
                    }
                });
            }
        }}
        disabled={enrollingCourse === course.title} // ✅ only disable the current one
    >
        {enrollingCourse === course.title ? "Enrolling..." : "Enroll"}
    </button>
)}




                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Courses;
