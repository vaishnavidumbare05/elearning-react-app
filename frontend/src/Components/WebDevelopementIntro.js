import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCheckCircle, FaStar } from "react-icons/fa"; // Add icons for badge
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios"; // Assuming you are using axios for API requests
import Course_Content from "./Web_Content";
import { useUser } from "./UserContext";




const Course = ({ currentCourseId }) => {
  const [activeSection, setActiveSection] = useState("content");
  const [progress, setProgress] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState({});
  const [assessmentStatuses, setAssessmentStatuses] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "", // Ensure the fifth assessment is initialized here
  });
  const { user } = useUser(); // Get the user from context
  const [courses, setCourses] = useState([]); // State to store courses
  const [loading, setLoading] = useState(true); // Loading state
  const [enrolling, setEnrolling] = useState(false); // State to manage enrollment loading

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost/backend/api/fetch-courses.php");
      if (response.data.success) {
        setCourses(response.data.courses); // Set courses state
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchCourses(); // Fetch courses when the component mounts
  }, []);



  useEffect(() => {
    fetchProgress();
  }, [currentCourseId]);

  const handleEnroll = async (courseTitle) => {
    if (!user || !user.userId) {
      console.error("❌ User ID is missing!", user);
      alert("User ID is missing. Please log in again.");
      return;
    }

    const requestData = {
      userId: user.userId,
      courseTitle: courseTitle,
    };

    console.log("📢 Sending Enrollment Request:", JSON.stringify(requestData));

    try {
      const response = await axios.post(
        "http://localhost/backend/api/enroll-course.php",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("📢 Enrollment Response:", response.data);

      if (response.data.success) {
        alert("✅ Enrolled successfully!");
      } else {
        console.error("❌ Enrollment Failed:", response.data.message);
        alert(`❌ Enrollment failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("❌ Error enrolling in course:", error);
      alert("⚠ An error occurred. Please try again.");
    }
  };

  // Fetch progress
  // Fetch progress
  const fetchProgress = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData?.userId;
      const courseId = currentCourseId;

      const response = await fetch("http://localhost/backend/routes/progress.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, courseId })
      });

      const data = await response.json();
      console.log("📥 Backend response:", data);

      // Force override progress to 0
      setProgress(0); // 👈 You override regardless of actual backend value

    } catch (error) {
      console.error("Error fetching progress:", error);
      setProgress(0);
    }
  };





  // Fetch status for each assessment
  const fetchAssessmentStatus = async (assessmentId) => {
    try {
      const response = await axios.get(`http://localhost/backend/routes/assessment_status.php?id=${assessmentId}`);
      console.log(`Fetched status for Assessment ${assessmentId}:`, response.data.status);
      setAssessmentStatuses((prevStatuses) => ({
        ...prevStatuses,
        [assessmentId]: response.data.status,
      }));
    } catch (error) {
      console.error("Error fetching assessment status:", error);
    }
  };

  useEffect(() => {
    fetchProgress();
    // Fetch status for all assessments
    [1, 2, 3, 4, 5].forEach((id) => fetchAssessmentStatus(id));
  }, []);

  const allAssessmentsCompleted = [1, 2, 3, 4].every(id => assessmentStatuses[id] === "completed");
  const isFifthAssessmentCompleted = assessmentStatuses[5] === "completed";





  // Badge based on progress (Choose between "Gold, Silver, Bronze" or "Hard, Normal, Easy")
  const getBadge = (progress) => {
    if (progress <= 33) {
      return {
        badge: "Bronze",
        icon: (
          <img
            src="/img/image_bronze.png"
            alt="Bronze Badge"
            width="58"
            height="55"
          />
        ),
      };
    } else if (progress <= 66) {
      return {
        badge: "Silver",
        icon: (
          <img
            src="/img/image_silver.png"
            alt="Silver Badge"
            width="58"
            height="55"
          />
        ),
      };
    } else {
      return {
        badge: "Gold",
        icon: (
          <img
            src="/img/image_gold.png"
            alt="Gold Badge"
            width="58"
            height="55"
          />
        ),
      };
    }
  };

  // Option 2: Hard, Normal, Easy Badge
  // if (progress <= 33) {
  //   return { badge: "Easy", icon: <FaStar color="green" /> };
  // } else if (progress <= 66) {
  //   return { badge: "Normal", icon: <FaStar color="blue" /> };
  // } else {
  //   return { badge: "Hard", icon: <FaStar color="red" /> };
  // }


  const badge = getBadge(progress);

  return (
    <div className="container mt-2">
      <div className="card shadow-sm rounded">
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start">
          <div className="d-flex align-items-center w-100 mb-3 mb-md-0">
            <img
              src={require("../img/sw.jpeg")}
              alt="Python Programming"
              className="img-fluid"
              style={{
                height: "150px",
                maxWidth: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                marginRight: "15px",
              }}
            />
            <div className="card-body d-flex justify-content-between align-items-center">
              {/* Left Section: Title, Progress, and Resume Button */}
              <div style={{ flex: 1 }}>
                <h5 className="card-title mb-2">Web Developement </h5>
                <p className="text-muted mb-1">In Progress</p>
                <div className="progress mb-2" style={{ height: "10px", width: "100%", maxWidth: "200px" }}>
                  <div className="progress-bar bg-info" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" />
                </div>
                <small className="text-muted">{progress}% completed</small>
                {/* Resume Button */}
                <div className="mt-2">

                  {/* Enroll button */}

                  <Link
                    to="/courses"  // Replace with the route you want to link to
                    className="btn btn-primary"
                    style={{ width: '120px', display: 'inline-block', textAlign: 'center' }}
                  >
                    Enroll
                  </Link>


                </div>
              </div>

              {/* Right Section: Badge Icon */}
              {/* Right Section: Badge Icon */}
              <div className="d-flex flex-column  ms-4">
                {/* Badge Icon */}
                <div className="mb-2">
                  {badge.icon}
                </div>

                {/* Badge Name */}
                <span className="badge text-dark fs-5">
                  {badge.badge}
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Toggle buttons for Content and Assessments */}
      <div className="btn-group mt-4 w-100" role="group">
        <button
          className={`btn ${activeSection === "content" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveSection("content")}
        >
          Content
        </button>
        <button
          className={`btn ${activeSection === "assessments" ? "btn-primary" : "btn-outline-primary"}`}
          //   onClick={() => {
          //     if (progress >= 50) setActiveSection("assessments");
          //   }}
          //   disabled={progress < 50} // Disable the button if progress is below 50%
          onClick={() => setActiveSection("assessments")}
        >
          Assessments
        </button>
      </div>

      {/* Content Section */}
      <div className="mt-4">
        {activeSection === "content" && <Course_Content />}

        {/* Assessments Section */}
        {activeSection === "assessments" && (
          <div>
            <h5>Assessments</h5>
            <p className="text-muted">Check your progress and complete pending assessments.</p>
            <ul className="list-group">
              {[1, 2].map((id) => (
                <li className="list-group-item d-flex justify-content-between align-items-center py-3" key={id}>
                  <div className="d-flex align-items-center">
                    <img src={require("../img/doc.gif")} alt="Assessment thumbnail" className="me-2" style={{ width: "40px", height: "40px" }} />
                    <div className="d-flex flex-column">
                      {assessmentStatuses[id] !== "completed" ? (
                        <Link to={``} className="text-decoration-none text-dark">
                          Assessment {id}
                        </Link>
                      ) : (
                        <span className="text-muted">Assessment {id}</span>
                      )}
                      
                    </div>
                  </div>

                </li>
              ))}

            </ul>

            {/* Show the button only when the fifth assessment is completed */}

            <button className="btn btn-success mt-4">Show Certificate</button>


            <button className="btn btn-success mt-4 ms-4">Progress Report</button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
