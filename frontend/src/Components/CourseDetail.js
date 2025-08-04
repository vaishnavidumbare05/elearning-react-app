import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
    const { id } = useParams(); // Get the lesson ID from the URL
    const [lesson, setLesson] = useState(null);

    useEffect(() => {
        // Fetch lesson details using the ID from the URL
        fetch(`http://localhost/Learning_backend/fetch_lesson.php?id=${id}`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setLesson(data);
                } else {
                    console.error("Error fetching lesson data:", data.error);
                }
            })
            .catch((error) => console.error("Error fetching lesson:", error));
    }, [id]);

    if (!lesson) {
        return <div>Loading...</div>; // Show loading state while fetching data
    }

    return (
        <div className="container mt-5">
            <h2>{lesson.title}</h2>
            <video width="600" controls>
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <p>{lesson.description}</p> {/* Assuming lesson object contains a description */}
        </div>
    );
};

export default CourseDetail;
