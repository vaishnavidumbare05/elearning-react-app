import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Course_Content from "./Web_Content";
import "bootstrap/dist/css/bootstrap.min.css";

const Course = ({ currentCourseId }) => {
  const [activeSection, setActiveSection] = useState("content");
  const [progress, setProgress] = useState(0);
  const [quizMetadata, setQuizMetadata] = useState({ quiz1Id: null, quiz2Id: null });
  const [completedQuizesList, setCompletedQuizesList] = useState([]);

  const navigate = useNavigate();




  // ✅ Fetch progress (only once per course)
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.userId;

        const response = await fetch("http://localhost/backend/routes/web_progress.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, courseId: currentCourseId }),
        });

        const data = await response.json();
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

    if (currentCourseId) {
      fetchProgress();
    }
  }, [currentCourseId]);

  // ✅ Fetch quiz metadata and completed quizzes
  useEffect(() => {
    const fetchMetadataAndCompletion = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.userId;

        const [quiz1Response, quiz2Response] = await Promise.all([
          axios.get("http://localhost/backend/api/fetch-web-questions.php"),
          axios.get("http://localhost/backend/api/fetch-web-questions2.php"),
        ]);

        const quiz1Id = quiz1Response.data.questions?.[0]?.id || quiz1Response.data?.[0]?.id || null;
        const quiz2Id = quiz2Response.data.questions?.[0]?.id || quiz2Response.data?.[0]?.id || null;

        setQuizMetadata({ quiz1Id, quiz2Id });

        const completedResponse = await axios.post("http://localhost/backend/api/get-completed-quizes.php", {
          userId,
          courseId: currentCourseId,
        });

        if (completedResponse.data?.success && Array.isArray(completedResponse.data.completedQuizes)) {
          setCompletedQuizesList(completedResponse.data.completedQuizes);
        } else {
          setCompletedQuizesList([]);
        }
      } catch (error) {
        console.error("Error fetching quiz metadata or completed quizzes:", error);
        setQuizMetadata({ quiz1Id: null, quiz2Id: null });
        setCompletedQuizesList([]);
      }
    };

    if (currentCourseId) {
      fetchMetadataAndCompletion();
    }
  }, [currentCourseId]);

  // ✅ Calculate quiz status dynamically
  const quiz1Status = useMemo(() => {
    if (!quizMetadata.quiz1Id) return "Incomplete";
    return completedQuizesList.some((q) => q.quizId === quizMetadata.quiz1Id) ? "Completed" : "Incomplete";
  }, [quizMetadata, completedQuizesList]);

  const quiz2Status = useMemo(() => {
    if (!quizMetadata.quiz2Id) return "Incomplete";
    return completedQuizesList.some((q) => q.quizId === quizMetadata.quiz2Id) ? "Completed" : "Incomplete";
  }, [quizMetadata, completedQuizesList]);


  const handleCertificateClick = () => {
    if (quiz1Status === 'Completed' && quiz2Status === 'Completed') {

      navigate(`/web-certificate/${currentCourseId}`);
    } else {
      alert('Please complete all lectures and assignments before accessing the certificate.');
    }
  };

  const getBadge = (progress) => {
    if (progress <= 33) {
      return {
        badge: "Bronze",
        icon: <img src="/img/image_bronze.png" alt="Bronze Badge" width="58" height="55" />,
      };
    } else if (progress <= 66) {
      return {
        badge: "Silver",
        icon: <img src="/img/image_silver.png" alt="Silver Badge" width="58" height="55" />,
      };
    } else {
      return {
        badge: "Gold",
        icon: <img src="/img/image_gold.png" alt="Gold Badge" width="58" height="55" />,
      };
    }
  };

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
              <div style={{ flex: 1 }}>
                <h5 className="card-title mb-2">Web Developement</h5>
                <p className="text-muted mb-1">In Progress</p>
                <div className="progress mb-2" style={{ height: "10px", width: "100%", maxWidth: "200px" }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
                <small className="text-muted">{progress}% completed</small>
                <div className="mt-2">
                  <Link to={`/web-course-content/${currentCourseId}`}>
                    <button className="btn btn-primary">Resume</button>
                  </Link>
                </div>
              </div>
              <div className="d-flex flex-column ms-4">
                <div className="mb-2">{badge.icon}</div>
                <span className="badge text-dark fs-5">{badge.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="btn-group mt-4 w-100" role="group">
        <button
          className={`btn ${activeSection === "content" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveSection("content")}
        >
          Content
        </button>
        <button
          className={`btn ${activeSection === "assessments" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => progress >= 100 && setActiveSection("assessments")}
          disabled={progress < 100}
        >
          Assessments
        </button>
      </div>

      <div className="mt-4">
        {activeSection === "content" && <Course_Content />}
        {activeSection === "assessments" && (
          <div style={{ marginBottom: "35px" }}>
            <h5>Assessments</h5>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
              <p className="text-muted mb-0">
                Check your progress and complete pending assessments.
              </p>

              <button
                className="btn btn-success mt-0"
                style={{ marginLeft: '400px' }}
                onClick={handleCertificateClick}
              >
                Show Certificate
              </button>

              <Link to={`/web-progress-report/${currentCourseId}`}>
                <button className="btn btn-success mt-0 ms-4">
                  Progress Report
                </button>
              </Link>
            </div>


            <div className="mt-3">
              {[1, 2].map((num) => {
                const status = num === 1 ? quiz1Status : quiz2Status;
                const link = num === 1 ? `/web/assessment/${currentCourseId}` : `/web/assessment2/${currentCourseId}`;
                const label = `Assignment ${num}`;

                return (
                  <div
                    key={num}
                    className="d-flex justify-content-between align-items-center bg-light text-dark p-3 mb-3"
                    style={{ borderRadius: "8px", width: "100%" }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={require("../img/doc.gif")}
                        alt="Assessment"
                        className="me-3"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <Link to={link} className="text-dark text-decoration-none fw-semibold">
                        {label}

                      </Link>
                    </div>

                    <span className={`badge ${status === "Completed" ? "bg-success" : "bg-secondary"} px-3 py-2`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
