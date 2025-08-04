import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import CardSlider from "./CardSlider";
import axios from "axios";
import { useUser } from "./UserContext";

const Dashboard = () => {
    const [videos, setVideos] = useState([]);
    const { user } = useUser(); // Get the user from context
    const [pythonProgress, setPythonProgress] = useState(0);
    const [completedVideos, setCompletedVideos] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);
    const [enrolledCourses, setEnrolledCourses] = useState([]); // Store enrolled courses
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch progress for Python Programming (e.g., from backend)
    const fetchProgress = async (courseId) => {
        try {
            const response = await axios.get(`http://localhost/backend/routes/progress.php?course_id=${courseId}`);
            const { progress } = response.data;
            setPythonProgress(progress || 0);
        } catch (error) {
            console.error("Error fetching progress:", error);
            setPythonProgress(0);
        }
    };

    useEffect(() => {
        fetchProgress("python-programming"); // Fetch progress for Python Programming
    }, []);

    useEffect(() => {
        if (user && user.name) {
            const userName = user.name; // Use the user's name
            const fetchCourseData = async () => {
                try {
                    // Fetching courses for the user
                    const response = await axios.get(`http://localhost/backend/api/enrolled-courses.php?userName=${userName}`);

                    console.log("API response:", response.data); // Debug the API response

                    // Ensure the response data is an array
                    if (Array.isArray(response.data)) {
                        setEnrolledCourses(response.data); // No filtering needed
                    }
                    else {
                        console.error('Received data is not an array', response.data);
                        setEnrolledCourses([]); // Default to empty array if data is not an array
                    }
                } catch (error) {
                    console.error('Error fetching enrolled courses:', error);
                    setEnrolledCourses([]); // Default to empty array on error
                } finally {
                    setLoading(false); // Set loading to false after fetching
                }
            };

            fetchCourseData();
        } else {
            setLoading(false); // Set loading to false if user is not available
        }
    }, [user]); // Dependency on `user` ensures it fetches courses when user changes

    // Default user name if not found
    const userName = user ? user.name : "Student";

    return (
        <div className="container my-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <h1 style={{ fontSize: "30px" }} className="me-3">
                    Welcome {userName}, continue learning
                </h1>
            </div>

            {/* Enrolled Courses Section */}
            <div className="my-4">
                <h3 className="mb-2">Enrolled Courses</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : enrolledCourses.length > 0 ? (
                    <div className="row">
                        {enrolledCourses.map(course => (
                            <div
                                className="col-md-4 mb-4 mt-2 ms-0">
                                <div className="card h-100 shadow" style={{ width: '90%', margin: '0 ' }}>
                                    <img
                                        src={course.image ? `http://localhost/backend/api/${course.image}` : require("../img/sw.jpeg")}
                                        className="card-img-top"
                                        alt={course.title}
                                    />
                                    <div className="card-body">
                                        {/* Redirect to /python-programming for Python Programming */}
                                        {course.title === "Python Programming" ? (
                                            <Link to={`/course/python/${course._id.$oid}`} className="card-title">

                                                <h5>{course.title}</h5>
                                            </Link>
                                        ) : (
                                            // Redirect to /course-page/:courseId for other courses

                                            <Link to={`/course/webdevelopement/${course._id.$oid}`} className="card-title">
                                                <h5>{course.title}</h5>
                                            </Link>
                                        )}
                                        <p className="text-muted">{course.duration}</p>
                                        {/* ✅ Go to Course link */}
                                        {/* <Link to={`/web-course-content/${course._id.$oid}`}>
                                        <div class="d-flex justify-content-center">
                                            <button className="btn btn-primary mt-2 text-center">Go to Course</button>
                                            </div>

                                        </Link> */}
                                        {course.title === "Python Programming" ? (
                                            // <Link to={`/course-content/${course._id.$oid}`} className="card-title">
                                            <Link to={`/course/python/${course._id.$oid}`} className="card-title">
                                                <div class="d-flex justify-content-center">
                                                    <button className="btn btn-primary mt-2 text-center">Go to Course</button>
                                                </div>
                                            </Link>
                                        ) : (
                                            // Redirect to /course-page/:courseId for other courses

                                            //<Link to={`/web-course-content/${course._id.$oid}`} className="card-title">
                                            <Link to={`/course/webdevelopement/${course._id.$oid}`} className="card-title">
                                                <div class="d-flex justify-content-center">
                                                    <button className="btn btn-primary mt-2 text-center">Go to Course</button>
                                                </div>

                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No courses enrolled yet.</p>
                )}
                {/* <div className="text-end">
                    <a href="#see-all" className="text-primary">
                        SEE ALL
                    </a>
                </div> */}
            </div>

            {/* Degree & Certificate Programs Section */}
            <div className="mt-5">
                <div className="d-flex align-items-center mb-4">
                    <span className="me-2" role="img" aria-label="Degree Icon">
                        🎓
                    </span>
                    <h4 className="mb-0">Certificate Programs</h4>
                </div>

            </div>
            <CardSlider />
        </div>
    );
};

export default Dashboard;
