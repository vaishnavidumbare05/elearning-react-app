import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import videoThumbnail from "../img/video.gif"; // Replace with the path to your video thumbnail

const Course_Content = ({currentCourseId}) => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // Fetch video data from MongoDB via PHP API
    fetch("http://localhost/backend/routes/web_videos.php") // Adjust the URL if needed
      .then((response) => response.json())
      .then((data) => {
        setLessons(data);
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  const renderBadge = (status) => {
    let badgeProps = {
      className: "badge rounded-circle me-2",
      style: {
        width: "25px",
        height: "25px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      "data-bs-toggle": "tooltip",
      title: "", // This will be populated based on the status
    };

    switch (status) {
      case "completed":
        badgeProps.style.backgroundColor = "rgba(0, 128, 0, 0.7)";
        badgeProps.title = "Completed";
        return (
          <span {...badgeProps}>
            <span style={{ fontSize: "14px", color: "green" }}>✓</span>
          </span>
        );
      case "incomplete":
        badgeProps.style.backgroundColor = "rgba(211, 211, 211, 0.7)";
        badgeProps.title = "Incomplete";
        return <span {...badgeProps}></span>;
      case "notOpened":
        badgeProps.style.border = "1px solid rgba(211, 211, 211, 0.5)";
        badgeProps.title = "Not Opened";
        return <span {...badgeProps}></span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5 course-container shadow p-4 rounded">
      <h5>Learning Videos</h5>
      <ul className="list-group">
        {lessons.map((lesson, index) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center py-3"
            key={index}
          >
            <div className="d-flex align-items-center">
              {/* <img
                src={videoThumbnail}
                alt="Video thumbnail"
                className="me-2"
                style={{ width: "40px", height: "40px" }}
              /> */}
              <i className="bi bi-collection-play"alt="Video thumbnail"
                style={{ width: "40px", height: "40px" }}></i>

              <div className="d-flex flex-column">
                {/* Navigate to /course-content */}
                {/* <Link
                 to={`/web-course-content/${currentCourseId}`}
                  className="text-decoration-none text-dark"
                >
                  {lesson.title}
                </Link> */}
                 <span
                  style={{ fontSize: "16px", color: "black" }}
                >
                  {lesson.title}
                </span>
                <span style={{ fontSize: "14px", color: "black" }}>
                  {lesson.duration}
                </span>
              </div>
            </div>
            <div className="d-none d-md-flex align-items-center">
              {renderBadge(lesson.status)}
            </div>
            <div className="d-flex d-md-none align-items-center">
              {renderBadge(lesson.status)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Course_Content;
