import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCheckCircle, FaStar } from "react-icons/fa"; // Add icons for badge
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios"; // Assuming you are using axios for API requests
import Course_Content from "./Web_Content";



const Course = ({ currentCourseId }) => {
  const [activeSection, setActiveSection] = useState("content");
  const [progress, setProgress] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState({});
  const [assessmentStatuses, setAssessmentStatuses] = useState({
    1: "",
    2: "",

  });
  const [quizMetadata, setQuizMetadata] = useState({ quiz1Id: null, quiz2Id: null }); // New state for quiz IDs
  const [completedQuizesList, setCompletedQuizesList] = useState([]);


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;
    fetchProgress();
  }, [currentCourseId]);
  const refreshCompletedQuizzes = async (userId, courseId) => {
    try {
      const response = await axios.post("http://localhost/backend/api/get-completed-quizes.php", {
        userId,
        courseId,
      });

      if (response.data?.success && Array.isArray(response.data.completedQuizes)) {
        setCompletedQuizesList(response.data.completedQuizes);
      } else {
        setCompletedQuizesList([]);
      }
    } catch (error) {
      console.error("Error fetching completed quizzes:", error);
      setCompletedQuizesList([]);
    }
  };
  // Fetch progress
  const fetchProgress = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData?.userId;
      const courseId = currentCourseId;

      console.log("📦 Sending to backend:", { userId, courseId });

      const response = await fetch("http://localhost/backend/routes/web_progress.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, courseId })
      });

      const data = await response.json();
      console.log("📥 Backend response:", data); // THIS is the log you want to see

      if (data.success) {
        setProgress(data.progress);
      } else {
        console.warn("Backend returned error:", data.message);
        setProgress(0);
      }
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
    [1, 2].forEach((id) => fetchAssessmentStatus(id));
  }, []);

  useEffect(() => {
    const fetchQuizMetadata = async () => {
      try {
        // Fetch Quiz 1 metadata
        const quiz1Response = await axios.get("http://localhost/backend/api/fetch-web-questions.php");
        const quiz1Questions = quiz1Response.data.questions || quiz1Response.data || [];
        const quiz1Id = quiz1Questions[0]?.id || null;

        // Fetch Quiz 2 metadata
        const quiz2Response = await axios.get("http://localhost/backend/api/fetch-web-questions2.php");
        const quiz2Questions = quiz2Response.data.questions || quiz2Response.data || [];
        const quiz2Id = quiz2Questions[0]?.id || null;

        setQuizMetadata({ quiz1Id, quiz2Id });
      } catch (error) {
        console.error("Error fetching quiz metadata:", error);
        setQuizMetadata({ quiz1Id: null, quiz2Id: null });
      }
    };

    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

    if (userId && currentCourseId) {
      fetchQuizMetadata();
      refreshCompletedQuizzes(userId, currentCourseId);
    }
  }, [currentCourseId]);


  // Updated quiz status logic using quizMetadata
  const quiz1Status = quizMetadata.quiz1Id && completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id) ? "Completed" : "Not Attempted";
  const quiz2Status = quizMetadata.quiz2Id && completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id) ? "Completed" : "Not Attempted";


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
                <h5 className="card-title mb-2">Web Developement</h5>
                <p className="text-muted mb-1">In Progress</p>
                <div className="progress mb-2" style={{ height: "10px", width: "100%", maxWidth: "200px" }}>
                  <div className="progress-bar bg-info" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" />
                </div>
                <small className="text-muted">{progress}% completed</small>
                {/* Resume Button */}
                <div className="mt-2">
                  <Link to={`/web-course-content/${currentCourseId}`}>
                    <button className="btn btn-primary">Resume</button>
                  </Link>


                </div>
              </div>

          
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
          onClick={() => {
            if (progress >= 100) setActiveSection("assessments");
          }}
          disabled={progress < 100} // Disable the button if progress is below 50%
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
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
              <p className="text-muted mb-0">
                Check your progress and complete pending assessments.
              </p>

              <Link to={`/web-certificate/${currentCourseId}`}>
                <button className="btn btn-success mt-0" style={{ marginLeft: '400px' }}>
                  Show Certificate
                </button>
              </Link>

              <Link to={`/web-progress-report/${currentCourseId}`}>
                <button className="btn btn-success mt-0 ms-4">
                  Progress Report
                </button>
              </Link>
            </div>
            <ul className="list-group">
              {[1, 2].map((id) => (
                <li className="list-group-item d-flex justify-content-between align-items-center py-3" key={id}>
                  <div className="d-flex align-items-center">
                    <img src={require("../img/doc.gif")} alt="Assessment thumbnail" className="me-2" style={{ width: "40px", height: "40px" }} />
                    <div className="d-flex flex-column">
                      {
                        id === 1 ? (
                          <Link to={`/web/assessment/${currentCourseId}`} className="text-decoration-none text-dark">
                            Assessment {id}
                          </Link>
                        ) : (
                          <Link to={`/web/assessment2/${currentCourseId}`} className="text-decoration-none text-dark">
                            Assessment {id}
                          </Link>
                        )
                      }
                      <span style={{ fontSize: "14px", color: "black" }}>
                        {assessmentStatuses[id] || "Loading..."}
                      </span>
                    </div>
                  </div>
                  <div className="d-none d-md-flex align-items-center">
                    {(id === 1
                      ? quiz1Status === "completed"
                      : quiz2Status === "completed") ? (
                      <span className="badge bg-success rounded-pill">
                        <FaCheckCircle /> Completed
                      </span>
                    ) : (
                      <span className="badge bg-warning rounded-pill">Pending</span>
                    )}
                  </div>
                </li>
              ))}

            </ul>


          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
