import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Web = () => {
    const [selectedVideo, setSelectedVideo] = useState(0);
    const [videos, setVideos] = useState([]);

    // Fetch videos from the backend (PHP + MongoDB)
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch("http://localhost/backend/api/lessons.php");
                const data = await response.json();
                console.log("Fetched Videos:", data);  // Debugging line
                setVideos(data);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        };

        fetchVideos();
    }, []);

    // Mark a video as completed and update in the database
    const markAsCompleted = async () => {
        const selectedVideoData = videos[selectedVideo]; // Get selected video object
        console.log("Selected Video Data:", selectedVideoData);  // Debugging line

        if (!selectedVideoData || !selectedVideoData.id) {
            console.error("Video ID is missing!");
            return;
        }

        const videoId = selectedVideoData.id; // Use 'id' instead of '_id'

        try {
            const response = await fetch(`http://localhost/backend/api/lessons.php?id=${videoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "completed" })
            });

            const result = await response.json();
            console.log("Update Result:", result);

            if (response.ok) {
                // Successfully updated status
                const updatedVideos = [...videos];
                updatedVideos[selectedVideo].status = "completed";
                setVideos(updatedVideos);
            } else {
                console.error(result.error || "Unknown error updating status");
            }
        } catch (error) {
            console.error("Error updating video status:", error);
        }
    };

    // Go to the next video
    const handleNext = () => {
        setSelectedVideo((prev) => Math.min(prev + 1, videos.length - 1));
    };

    // Go to the previous video
    const handlePrevious = () => {
        setSelectedVideo((prev) => Math.max(prev - 1, 0));
    };

    // Render badge based on video status
    const renderBadge = (status) => {
        let badgeClass = "badge ";
        let badgeText = "";
        switch (status) {
            case "completed":
                badgeClass += "bg-success";
                badgeText = "Completed";
                break;
            case "in-progress":
                badgeClass += "bg-warning";
                badgeText = "In Progress";
                break;
            case "not-started":
            case "notOpened":
                badgeClass += "bg-secondary";
                badgeText = "Not Started";
                break;
            case "incomplete":
                badgeClass += "bg-danger";
                badgeText = "Incomplete";
                break;
            default:
                badgeClass += "bg-secondary";
                badgeText = "Unknown";
        }
        return <span className={badgeClass}>{badgeText}</span>;
    };

    // Handle the case when no videos are fetched yet
    if (videos.length === 0) {
        return <div>Loading...</div>; // Show loading text or spinner
    }

    // Ensure selectedVideo is within valid bounds
    const currentVideo = videos[selectedVideo];

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/CoursePage">Courses</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/course-page">Web Development Course</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {currentVideo?.title || "Video"} {/* Fallback if no video is selected */}
                    </li>
                </ol>
            </nav>

            <div className="row">
                <div className="card flex-fill" style={{ height: "100vh" }}>
                    <div className="row g-0 h-100">
                        <div className="col-md-4 border-end d-none d-md-block">
                            <div
                                className="card-body scrollable-content"
                                style={{ maxHeight: "590px", overflowY: "auto" }}
                            >
                                <h5 className="text-center">Learning Videos</h5>
                                <ul className="list-group">
                                    {videos.map((video, index) => (
                                        <li
                                            key={index}
                                            className={`list-group-item d-flex justify-content-between align-items-center py-3 ${selectedVideo === index ? "bg-primary text-white" : "bg-light text-dark"
                                                }`}
                                            onClick={() => setSelectedVideo(index)}
                                            style={{
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                border: "none",
                                                borderBottom: index !== videos.length - 1 ? "1px solid #ddd" : "none",
                                            }}
                                        >
                                            <div className="d-flex flex-column">
                                                <Link
                                                    to="#"
                                                    className={`text-decoration-none ${selectedVideo === index ? "text-white" : "text-dark"}`}
                                                >
                                                    {video.title}
                                                </Link>
                                                <span style={{ fontSize: "14px", color: selectedVideo === index ? "white" : "black" }}>
                                                    {video.duration}
                                                </span>
                                            </div>
                                            <div className="d-none d-md-flex align-items-center">
                                                {renderBadge(video.status)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-8 d-flex flex-column">
                            <div className="card-body">
                                <h5 className="card-title">{currentVideo?.title || "Video Title"}</h5>
                                <p className="card-text">{currentVideo?.content || "Video content not available."}</p>
                                {/* Video without controls */}
                                <video
                                    width="100%"
                                    height="400"
                                    src={currentVideo?.videoUrl || ""}
                                    type="video/mp4"
                                    style={{ background: "#000" }}
                                    autoPlay
                                >
                                    Your browser does not support the video tag or the file format of this video.
                                </video>

                            </div>

                            <div className="card-footer d-flex justify-content-between">
                                <button className="btn btn-danger" onClick={handlePrevious} disabled={selectedVideo === 0}>
                                    Previous
                                </button>
                                <button className="btn btn-success" onClick={markAsCompleted}>
                                    Mark as Completed
                                </button>
                                <button className="btn btn-success" onClick={handleNext} disabled={selectedVideo === videos.length - 1}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Web;
