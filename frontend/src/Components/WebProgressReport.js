import React, { useState, useEffect, useRef } from "react";
import { useUser } from './UserContext';
import { ProgressBar, Button } from "react-bootstrap";
import logo from '../img/logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./ProgressReport.css";


const WebProgressReport = ({currentCourseId}) => {
    const { user } = useUser();
    // const [quizStats, setQuizStats] = useState({ correctAnswer: 0, totalQuestion: 0 });
    const pdfRef = useRef();
    const [progressData, setProgressData] = useState({
        userName: '',
        courseTitle: '',
        duration: 'Calculating...',
        courseCompletion: 0,
        lecturesCompleted: 0,
        totalLectures: 0,
        assignmentCompleted: 0,
        totalAssignment: 0,
        assignmentCompletion: 0,
        onTime: 0,
        pointsAverage: 0,
        scorePercentage: 0,       // ✅ new
        totalCorrect: 0,          // ✅ new
        totalQuestion: 0,         // ✅ new
        quizAverage: 0,
        classes: [],
        isLoading: true,
        error: ''
    });

    // Add this function for PDF generation
    const downloadPDF = () => {
        const input = pdfRef.current;
        const pdf = new jsPDF('p', 'mm', 'a4');

        html2canvas(input, {
            scale: 2,
            useCORS: true,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Check if content fits on one page
            if (imgHeight < 297) { // 297mm is A4 height
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                // If content is too long, scale it down to fit
                const ratio = 297 / imgHeight;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, 297);
            }

            pdf.save(`${user?.name || 'student'}_progress_report.pdf`);
        });
    };





    // Circular Progress Loader Component
    const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const color = percentage >= 70 ? '#4CAF50' : percentage >= 40 ? '#FFC107' : '#F44336';

        return (
            <div className="circular-progress-container" style={{ width: size, height: size }}>
                <svg className="circular-progress-svg" width={size} height={size}>
                    {/* White background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={size / 2}
                        fill="white"
                    />
                    {/* Background track */}
                    <circle
                        className="circular-progress-bg"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress track */}
                    <circle
                        className="circular-progress-fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ stroke: color }}
                        fill="transparent"
                    />
                </svg>
                <div className="circular-progress-text">
                    {percentage}%
                </div>
            </div>
        );
    };

    const fetchProgressPercentage = async (userId) => {
        const courseId = currentCourseId;
        try {
            const response = await fetch("http://localhost/backend/routes/web_progress.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, courseId}), // 🔹 Only userId now
            });

            const text = await response.text();
            console.log("Raw response:", text);
            const data = JSON.parse(text);

            // 🔹 Return progress and courseId both
            return {
                progress: data.progress ?? 0,
                courseId: data.courseId ?? null
            };
        } catch (error) {
            console.error("Error fetching progress percentage:", error);
            return {
                progress: 0,
                courseId: null
            };
        }
    };




    // const fetchLectureData = async (userId) => {
    //     try {
    //         const response = await fetch('http://localhost/backend/api/get-progress-data.php', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ userId })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const text = await response.text();
    //         if (!text) {
    //             return { completed: 0, total: 0, classes: [] };
    //         }

    //         const data = JSON.parse(text);
    //         return {
    //             completed: data.lecturesCompleted || 0,
    //             total: data.totalLectures || 0,
    //             classes: data.classes || []
    //         };
    //     } catch (error) {
    //         console.error("Error fetching lecture data:", error);
    //         return { completed: 0, total: 0, classes: [] };
    //     }
    // };

    // const fetchAssignmentData = async (userId) => {
    //     try {
    //         const response = await fetch('http://localhost/backend/api/get-progress-data.php', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ userId })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const data = await response.json();
    //         return {
    //             completed: data.assignmentsCompleted || 0,  // Updated field name
    //             total: data.totalAssignments || 0,          // Updated field name
    //             completion: data.assignmentCompletion || 0, // Updated field name
    //             classes: data.assignmentClasses || []       // New field from backend
    //         };
    //     } catch (error) {
    //         console.error("Error fetching assignment data:", error);
    //         return { completed: 0, total: 0, completion: 0, classes: [] };
    //     }
    // };
   const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return 'Not specified';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    let result = '';
    if (mins > 0) result += `${mins} min `;
    if (secs > 0) result += `${secs} sec`;

    return result.trim();
};


  useEffect(() => {
    const fetchProgressReport = async () => {
        try {
            if (!user || !user.userId || !user.name) {
                throw new Error("Please log in to view progress report");
            }

            // 🔹 Fetch progress percentage (includes courseId)
            const { progress, courseId } = await fetchProgressPercentage(user.userId);

            // 🔹 Fetch all report data in one call
            const response = await fetch('http://localhost/backend/api/get-web-progress-data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.userId, courseId: currentCourseId })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("📦 Combined Progress Report Data:", data);

            if (data.error) throw new Error(data.error);

            setProgressData({
                userName: data.userName || '',
                courseTitle: data.courseTitle || '',
                duration: formatDuration(data.totalDuration),
                courseCompletion: progress,
                lecturesCompleted: data.lecturesCompleted || 0,
                totalLectures: data.totalLectures || 0,
                assignmentCompleted: data.assignmentData?.completed || 0,
                totalAssignment: data.assignmentData?.total || 0,
                assignmentCompletion: data.assignmentData?.completion || 0,
                onTime: data.onTime || 0,
                pointsAverage: data.pointsAverage || 0,
                quizAverage: data.scorePercentage || 0,
                scorePercentage: data.scorePercentage || 0,
                totalCorrect: data.totalCorrect || 0,
                totalQuestion: data.totalQuestion || 0,
                classes: data.assignmentData?.classes || [],
                isLoading: false,
                error: ''
            });
        } catch (error) {
            console.error("❌ Error fetching progress report:", error);
            setProgressData(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));
        }
    };

    fetchProgressReport();
}, [user]);


    if (progressData.isLoading) {
        return <div className="text-center mt-5">Loading progress data...</div>;
    }

    if (progressData.error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Progress Report Error</h4>
                    <p>{progressData.error}</p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-3 text-muted small">
                            <p>Debug Info:</p>
                            <ul>
                                <li>User ID: {user?._id || 'Not available'}</li>
                                <li>Login Status: {user ? 'Logged In' : 'Not Logged In'}</li>
                            </ul>
                        </div>
                    )}

                    {(!user || !user._id) && (
                        <div className="mt-3">
                            <a href="/login" className="btn btn-primary">Login Again</a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (



        <div className="container mt-2 p-4 border rounded bg-white shadow-sm" style={{ width: "800px" }}>

            {/* Add download button at the top */}
            <div className="text-end">
                <Button variant="primary" onClick={downloadPDF}>
                    <i className="bi bi-download "></i> Download PDF
                </Button>
            </div>

            {/* A4-sized container */}
            <div
                ref={pdfRef}
                className="a4-container bg-white p-4 shadow-sm"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    margin: '0 auto',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div className="d-flex align-items-center mb-2">
                    <img
                        src={logo}
                        alt="Schoolytics"
                        style={{ height: "70px", width: "70px", marginRight: "5px" }}
                    />
                    <h5 className="ms-0">Syntax School</h5>
                    <h2 style={{ marginLeft: "50px" }}>Progress Report</h2>
                </div>

                {/* Student Info */}
                <p style={{ marginTop: "20px" }}><strong>Student Name:</strong> {progressData.userName}</p>
                <p><strong>Course Name:</strong> {progressData.courseTitle}</p>
                <p><strong>Duration:</strong> {progressData.duration}</p>

                {/* Summary */}
                <h6 style={{ marginTop: "25px" }}><strong>SUMMARY</strong></h6>
                <p>
                    {progressData.userName} has completed <strong>{progressData.courseCompletion}%</strong> of the Course
                    and gained <strong>{progressData.scorePercentage}</strong>% in his assignments,demonstrated study progress.
                </p>

                {/* Circular Stats */}
                <div className="row text-center mb-4" style={{ marginTop: "50px" }}>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Course Completion<br />{progressData.courseCompletion}%</p>
                            <CircularProgress percentage={progressData.courseCompletion} />

                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Lectures Completed</p><br />
                            <h2 className="text-success">{progressData.lecturesCompleted}</h2>

                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Total Lectures</p><br />
                            <h2 className="text-info">{progressData.totalLectures}</h2>

                        </div>
                    </div>
                </div>

                {/* Assignment Stats */}
                <div className="row text-center mb-4" style={{ marginTop: "50px" }}>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Assignment Completion<br />{progressData.assignmentCompletion}%</p>
                            <CircularProgress percentage={progressData.assignmentCompletion} />
                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Assignments Completed</p><br />
                            <h2 className="text-success">{progressData.assignmentCompleted}</h2>
                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <p className="text-muted mt-2">Total Assignments</p><br />
                            <h2 className="text-info">{progressData.totalAssignment}</h2>
                        </div>
                    </div>
                </div>

                <p style={{ marginTop: "50px" }}><strong>Grade:</strong>  {progressData.scorePercentage}%</p>
                <p><strong>Corrected Answers:</strong> {progressData.totalCorrect}</p>
                <p><strong>Total Questions:</strong> {progressData.totalQuestion}</p>
            </div>
        </div>
    );
};

export default WebProgressReport;