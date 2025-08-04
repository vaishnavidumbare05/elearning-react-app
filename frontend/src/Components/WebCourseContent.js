import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import apiClient from "../api/apiClient";
import axios from "axios";
import { useUser } from './UserContext';

const CourseContent = ({ currentCourseId }) => {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [videos, setVideos] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [output, setOutput] = useState("");
  const videoRef = useRef(null);
const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);
 const [lastTime, setLastTime] = useState(0);

  const [showQuizzes, setShowQuizzes] = useState(false);
  const [showQuizzes2, setShowQuizzes2] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questions2, setQuestions2] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedAnswers2, setSelectedAnswers2] = useState({});
  const [score, setScore] = useState(null);
  const [score2, setScore2] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attempts2, setAttempts2] = useState([]);
  const [allVideosCompleted, setAllVideosCompleted] = useState(false);
  const [quiz1Attempted, setQuiz1Attempted] = useState(false);
  const [quiz1AttemptedOnce, setQuiz1AttemptedOnce] = useState(false);
  const [unlockQuiz2, setUnlockQuiz2] = useState(false);
  const { userId } = useUser();
  const [inProgressLectures, setInProgressLectures] = useState([]);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [completedQuizesList, setCompletedQuizesList] = useState([]);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [quizMetadata, setQuizMetadata] = useState({ quiz1Id: null, quiz2Id: null }); // New state for quiz IDs

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiClient.get("http://localhost/backend/api/fetch-webvideos.php");
        if (Array.isArray(response.data)) {
          setVideos(response.data);
        } else {
          console.error("Unexpected response format: expected an array.");
          setVideos([]);
        }
      } catch (error) {
        console.error("Failed to fetch videos", error);
      }
    };
    fetchVideos();
  }, []);

 



  useEffect(() => {
    const fetchCompletedLectures = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData?.userId;

      if (!userId || !currentCourseId) {
        console.error("Missing user ID or course ID");
        return;
      }

      try {
        const response = await axios.post("http://localhost/backend/api/get-completed-lectures.php", {
          userId,
          courseId: currentCourseId
        });

        if (response.data?.success && Array.isArray(response.data.completedLectures)) {
          const normalizedIds = response.data.completedLectures.map(id =>
            typeof id === "object" && id.$oid ? id.$oid : id
          );
          setCompletedLectures(normalizedIds);
        } else {
          console.error("Unexpected response format for completed lectures:", response.data);
          setCompletedLectures([]);
        }
      } catch (error) {
        console.error("Error fetching completed lectures:", error);
      }
    };

    fetchCompletedLectures();
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

  // New useEffect to fetch quiz metadata on mount
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

  const renderBadge = (status) => {
    if (status === "completed") {
      return <span className="badge rounded-pill bg-success">Completed</span>;
    } else if (status === "in-progress") {
      return <span className="badge rounded-pill bg-warning">In Progress</span>;
    } else {
      return <span className="badge rounded-pill bg-secondary">Incomplete</span>;
    }
  };

  const markAsCompleted = async () => {
    const video = videos[selectedVideo];

    if (!video || !video._id) {
      console.error("Video ID is missing");
      return;
    }

    const lectureId = typeof video._id === "object" && video._id.$oid ? video._id.$oid : video._id;
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

    if (!userId || !currentCourseId) {
      console.error("Missing user ID or course ID");
      return;
    }

    try {
      const response = await axios.post("http://localhost/backend/api/mark-lec-completed-web.php", {
        userId,
        courseId: currentCourseId,
        lectureId
      });

      if (response.data?.success) {
        setCompletedLectures(prev => {
          if (!prev.includes(lectureId)) {
            return [...prev, lectureId];
          }
          return prev;
        });
        setInProgressLectures(prev => prev.filter(id => id !== lectureId));
      } else {
        console.error("Failed to mark lecture as completed:", response.data);
      }
    } catch (error) {
      console.error("Error marking lecture as completed:", error);
    }
  };
  useEffect(() => {
  setHasMarkedCompleted(false); // Reset when video changes
}, [selectedVideo]);

const handleVideoProgress = () => {
  const videoEl = videoRef.current;
  if (!videoEl || hasMarkedCompleted) return;

  const percentWatched = (videoEl.currentTime / videoEl.duration) * 100;

  setLastTime(videoEl.currentTime); // track current time as safe

  if (percentWatched >= 98) {
    markAsCompleted();
    setHasMarkedCompleted(true);
  }
};


const handleVideoEnded = () => {
  if (!hasMarkedCompleted) {
    markAsCompleted();
    setHasMarkedCompleted(true);
  }
};

const handleSeeking = () => {
  const videoEl = videoRef.current;
  if (!videoEl) return;

  const attemptedTime = videoEl.currentTime;
  // If user tries to seek ahead, revert
  if (attemptedTime > lastTime + 1) {
    videoEl.currentTime = lastTime;
  }
};



  const handleNext = () => {
    setVideos((prevVideos) => {
      const updatedVideos = [...prevVideos];
      if (updatedVideos[selectedVideo].status === "in-progress") {
        updatedVideos[selectedVideo].status = "incomplete";
      }
      if (selectedVideo < videos.length - 1) {
        updatedVideos[selectedVideo + 1].status = "in-progress";
      }
      return updatedVideos;
    });

    if (selectedVideo < videos.length - 1) {
      setSelectedVideo(selectedVideo + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedVideo > 0) {
      setVideos((prevVideos) => {
        const updatedVideos = [...prevVideos];
        updatedVideos[selectedVideo].status = "incomplete";
        return updatedVideos;
      });
      setSelectedVideo((prevSelectedVideo) => prevSelectedVideo - 1);
    }
  };

  useEffect(() => {
    if (videos.length > 0 && completedLectures.length > 0) {
      const allCompleted = videos.every(video =>
        completedLectures.includes(video._id) ||
        completedLectures.includes(video._id?.$oid)
      );
      setAllVideosCompleted(allCompleted);
    } else {
      setAllVideosCompleted(false);
    }
  }, [videos, completedLectures]);

  useEffect(() => {
    setQuiz1AttemptedOnce(completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id));
  }, [completedQuizesList, quizMetadata.quiz1Id]);

  useEffect(() => {
    setUnlockQuiz2(allVideosCompleted && quiz1AttemptedOnce);
  }, [allVideosCompleted, quiz1AttemptedOnce]);

  const handleQuiz1Click = () => {
    if (!allVideosCompleted) {
      alert("Please complete all videos before attempting Quiz 1");
      return;
    }
    setShowQuizzes(true);
    setShowQuizzes2(false);
    setSidebarVisible(false);
  };

  const handleQuiz2Click = () => {
    if (!unlockQuiz2) {
      const messages = [];
      if (!allVideosCompleted) messages.push("Complete all videos");
      if (!quiz1AttemptedOnce) messages.push("Attempt Quiz 1 exactly once");
      alert(`Unlock Quiz 2 by:\n- ${messages.join("\n- ")}`);
      return;
    }
    setShowQuizzes2(true);
    setShowQuizzes(false);
    setSidebarVisible(false);
  };

  useEffect(() => {
    if (showQuizzes && !questions.length) {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get("http://localhost/backend/api/fetch-web-questions.php");
          const questionsData = response.data.questions || response.data || [];
          setQuestions(Array.isArray(questionsData) ? questionsData : []);
          setSelectedAnswers({});
          setScore(null);
          setCurrentIndex(0);
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        }
      };
      fetchQuestions();
    }
  }, [showQuizzes]);

  useEffect(() => {
    if (showQuizzes2 && !questions2.length) {
      const fetchQuestions2 = async () => {
        try {
          const response = await axios.get("http://localhost/backend/api/fetch-web-questions2.php");
          const questionsData = response.data.questions || response.data || [];
          setQuestions2(Array.isArray(questionsData) ? questionsData : []);
          setSelectedAnswers2({});
          setScore2(null);
          setCurrentIndex2(0);
        } catch (error) {
          console.error("Error fetching questions for quiz 2:", error);
          setQuestions2([]);
        }
      };
      fetchQuestions2();
    }
  }, [showQuizzes2]);

  const selectAnswer = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers)) {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
    }
  };

  const selectAnswer2 = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers2)) {
      setSelectedAnswers2({ ...selectedAnswers2, [questionIndex]: option });
    }
  };

  const submitQuiz = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;
    const currentQuizId = quizMetadata.quiz1Id;

    if (!userId || !currentCourseId || !currentQuizId) {
      console.error("Missing userId, courseId, or quizId");
      setSubmissionMessage("Error: Missing required data.");
      return;
    }

    if (completedQuizesList.some(q => q.quizId === currentQuizId)) {
      alert("Only one attempt allowed for this quiz");
      return;
    }

    let correctCount = 0;
    let totalCorrect = 0;
    let totalMarks = 0;

    questions.forEach((q, index) => {
      totalMarks += q.marks || 1;
      if (selectedAnswers[index] === q.answer) {
        correctCount += q.marks || 1;
        totalCorrect++;
      }
    });

    const formattedDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const newAttempt = {
      userId,
      courseId: currentCourseId,
      quizId: currentQuizId,
      score: correctCount,
      totalMarks,
      totalCorrect,
      totalQuestions: questions.length,
      date: formattedDate,
      attempt: completedQuizesList.filter(q => q.quizId === currentQuizId).length + 1
    };

    console.log("Sending quiz data to backend:", newAttempt);

    try {
      const response = await axios.post("http://localhost/backend/api/save-completed-webquiz.php", newAttempt);
      console.log("Quiz submission response:", response.data);

      if (!response.data.success && response.data.status !== "success") {
        console.error("Quiz not saved:", response.data.message);
        setSubmissionMessage("Failed to save quiz. Please try again.");
        return;
      }

      setCompletedQuizesList(prev => [...prev, newAttempt]);
      setScore(correctCount);
      setSubmissionMessage(`Quiz submitted successfully! Score: ${correctCount}/${totalMarks}`);
      setUnlockQuiz2(allVideosCompleted && true);

      setSelectedAnswers({});
      setCurrentIndex(0);

      await refreshCompletedQuizzes(userId, currentCourseId);
    } catch (error) {
      console.error("Error saving quiz attempt:", error.response?.data || error.message);
      setSubmissionMessage("Error submitting quiz. Please try again.");
    }
  };

  const submitQuiz2 = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;
    const currentQuizId = quizMetadata.quiz2Id;

    if (!userId || !currentCourseId || !currentQuizId) {
      console.error("Missing userId, courseId, or quizId");
      setSubmissionMessage("Error: Missing required data.");
      return;
    }

    if (completedQuizesList.some(q => q.quizId === currentQuizId)) {
      alert("Only one attempt allowed for this quiz");
      return;
    }

    let correctCount = 0;
    let totalCorrect = 0;
    let totalMarks = 0;

    questions2.forEach((q, index) => {
      totalMarks += q.marks || 1;
      if (selectedAnswers2[index] === q.answer) {
        correctCount += q.marks || 1;
        totalCorrect++;
      }
    });

    const formattedDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const newAttempt = {
      userId,
      courseId: currentCourseId,
      quizId: currentQuizId,
      score: correctCount,
      totalMarks,
      totalCorrect,
      totalQuestions: questions2.length,
      date: formattedDate,
      attempt: completedQuizesList.filter(q => q.quizId === currentQuizId).length + 1
    };

    console.log("Sending quiz 2 data:", newAttempt);

    try {
      const response = await axios.post("http://localhost/backend/api/save-completed-webquiz.php", newAttempt);
      console.log("Quiz 2 submission response:", response.data);

      if (!response.data.success && response.data.status !== "success") {
        console.error("Quiz 2 not saved:", response.data.message);
        setSubmissionMessage("Failed to save quiz. Please try again.");
        return;
      }

      setCompletedQuizesList(prev => [...prev, newAttempt]);
      setScore2(correctCount);
      setSubmissionMessage(`Quiz 2 submitted successfully! Score: ${correctCount}/${totalMarks}`);
      setSelectedAnswers2({});
      setCurrentIndex2(0);

      await refreshCompletedQuizzes(userId, currentCourseId);
    } catch (error) {
      console.error("Error saving quiz 2 attempt:", error.response?.data || error.message);
      setSubmissionMessage("Error submitting quiz. Please try again.");
    }
  };

  const handleQuizPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleQuizNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleQuizPrev2 = () => {
    if (currentIndex2 > 0) setCurrentIndex2(currentIndex2 - 1);
  };

  const handleQuizNext2 = () => {
    if (currentIndex2 < questions2.length - 1) setCurrentIndex2(currentIndex2 + 1);
  };

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/courses">Courses</Link>
          </li>
          <li key={currentCourseId} className="breadcrumb-item">
            <Link to={`/course/webdevelopement/${currentCourseId}`} className="card-title">
              Web Developement
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {videos[selectedVideo]?.title || "Course Content"}
          </li>
        </ol>
      </nav>

      {videos.length > 0 ? (
        <div className="row">
          <div className="col-12 d-md-none">
            <button
              className="btn btn-primary mb-3"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <i className={`bi ${sidebarVisible ? 'bi-x' : 'bi-list'}`} style={{ fontSize: '1.5rem' }}></i>
            </button>
          </div>

          <div className={`col-md-4 border-end ${sidebarVisible ? "d-block" : "d-none"} d-md-block`} style={{ maxHeight: "100vh", overflowY: "auto" }}>
            <div className="card-body scrollable-content">
              <h5 className="text-center">Learning Videos</h5>
              <ul className="list-group">
                {videos.map((video, index) => {
                  const lectureId = video._id?.$oid || video._id;
                  let status = "incomplete";

                  if (completedLectures.includes(lectureId)) {
                    status = "completed";
                  } else if (inProgressLectures.includes(lectureId)) {
                    status = "in-progress";
                  }

                  return (
                    <li
                      className={`list-group-item d-flex justify-content-between align-items-center py-3 ${selectedVideo === index ? "bg-primary text-white" : "bg-light text-dark"}`}
                      key={index}
                      onClick={() => {
                        setSelectedVideo(index);
                        setSidebarVisible(false);
                        setShowQuizzes(false);
                        setShowQuizzes2(false);
                        if (!completedLectures.includes(lectureId) && !inProgressLectures.includes(lectureId)) {
                          setInProgressLectures(prev => [...prev, lectureId]);
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        transition: "0.3s",
                        borderBottom: index !== videos.length - 1 ? "1px solid #ddd" : "none",
                      }}
                    >
                      <div className="d-flex flex-column">
                        <Link to="#" className={`text-decoration-none ${selectedVideo === index ? "text-white" : "text-dark"}`}>
                          {video.title}
                        </Link>
                        <span style={{ fontSize: "14px", color: selectedVideo === index ? "white" : "black" }}>
                          {video.duration || "Unknown Duration"}
                        </span>
                      </div>
                      <div className="d-none d-md-flex align-items-center">{renderBadge(status)}</div>
                    </li>
                  );
                })}
                <li
                  className={`list-group-item text-center ${quiz1Status === "Completed" ? 'bg-warning' : 'bg-secondary'} text-dark mt-2`}
                  style={{
                    cursor: quiz1Status === "Completed" ? "pointer" : "not-allowed",
                    opacity: quiz1Status === "Completed" ? 0.7 : 1
                  }}
                  onClick={handleQuiz1Click}
                  title={quiz1Status === "Completed" ? "Quiz already completed" : ""}
                >
                  Quiz 1
                  {quiz1Status === "Not Attempted" && <i className="bi bi-lock ms-2"></i>}
                  {quiz1Status === "Completed" && <i className="bi bi-check-circle ms-2 text-success"></i>}
                </li>
                <li
                  className={`list-group-item text-center ${quiz2Status === "Completed" ? 'bg-info' : 'bg-secondary'} text-dark mt-2`}
                  style={{
                    cursor: quiz2Status === "Completed" ? "pointer" : "not-allowed",
                    opacity: quiz2Status === "Completed" ? 0.7 : 1
                  }}
                  onClick={handleQuiz2Click}
                  title={quiz2Status === "Not Attempted" ? "Complete requirements to unlock" : quiz2Status === "Completed" ? "Quiz already completed" : ""}
                >
                  Quiz 2
                  {quiz2Status === "Not Attempted" && <i className="bi bi-lock ms-2"></i>}
                  {quiz2Status === "Completed" && <i className="bi bi-check-circle ms-2 text-success"></i>}
                  {quiz2Status === "Not Attempted" && unlockQuiz2 && !completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id) && <i className="bi bi-unlock ms-2 text-success"></i>}
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-8 d-flex flex-column mt-3 mt-md-0">
            {showQuizzes ? (
              <div className="card-body">
                <h5 className="mb-3">Quiz 1</h5>
                {submissionMessage && (
                  <div className={`alert ${submissionMessage.includes("Error") ? "alert-danger" : "alert-success"} mb-3 alert-dismissible`}>
                    {submissionMessage}
                    <button type="button" className="btn-close" onClick={() => setSubmissionMessage("")}></button>
                  </div>
                )}
                {questions.length > 0 ? (
                  <>
                    <div className="mb-3 p-3 border rounded">
                      <p>
                        <strong>Question {currentIndex + 1}:</strong> {questions[currentIndex].question}
                        {questions[currentIndex].marks && (
                          <span className="text-muted"> ({questions[currentIndex].marks} marks)</span>
                        )}
                      </p>
                      <div className="d-flex flex-column">
                        {questions[currentIndex].options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            className={`btn my-1 text-start ${selectedAnswers[currentIndex] === option
                              ? option === questions[currentIndex].answer
                                ? "btn-success"
                                : "btn-danger"
                              : "btn-outline-secondary"
                              }`}
                            onClick={() => selectAnswer(currentIndex, option)}
                            disabled={currentIndex in selectedAnswers || completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {selectedAnswers[currentIndex] && (
                        <div className="mt-2">
                          {selectedAnswers[currentIndex] === questions[currentIndex].answer ? (
                            <p className="text-success">Correct!</p>
                          ) : (
                            <p className="text-danger">
                              Incorrect. The correct answer is: <strong>{questions[currentIndex].answer}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-secondary"
                        onClick={handleQuizPrev}
                        disabled={currentIndex === 0}
                      >
                        Previous
                      </button>
                      <span>
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={handleQuizNext}
                        disabled={currentIndex === questions.length - 1}
                      >
                        Next
                      </button>
                    </div>
                    {Object.keys(selectedAnswers).length === questions.length && (
                      <button
                        onClick={submitQuiz}
                        disabled={completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id)}
                        className="btn btn-primary w-100 mt-3"
                        style={{
                          opacity: completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id) ? 0.6 : 1,
                          cursor: completedQuizesList.some(q => q.quizId === quizMetadata.quiz1Id) ? "not-allowed" : "pointer",
                        }}
                      >
                        Submit Quiz
                      </button>
                    )}
                    {completedQuizesList.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Completed Quizzes</h3>
                        <ul className="space-y-2">
                          {completedQuizesList
                            .filter(quiz => quiz.quizId === quizMetadata.quiz1Id)
                            .map((quiz, index) => (
                              <li key={quiz.quizId || index} className="p-2 border rounded-md shadow">
                                <p><strong>Quiz Attempt:</strong> {quiz.attempt}</p>
                                <p><strong>Score:</strong> {quiz.score} / {quiz.totalMarks}</p>
                                <p><strong>Date:</strong> {quiz.date}</p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : (
                      <p>No quizzes completed yet.</p>
                    )}
                    {attempts.length > 0 && (
                      <div className="mt-4">
                        <h5>Attempt History</h5>
                        <ul className="list-group">
                          {attempts.map((attempt, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between">
                              <span>Attempt #{attempt.attemptNumber}</span>
                              <span>
                                {attempt.totalCorrect}/{attempt.totalQuestions} correct ({attempt.score}/{attempt.totalMarks} marks)
                              </span>
                              <small className="text-muted">{attempt.date}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p>{questions.length === 0 ? "No questions available" : "Loading questions..."}</p>
                  </div>
                )}
              </div>
            ) : showQuizzes2 ? (
              <div className="card-body">
                <h5 className="mb-3">Quiz 2</h5>
                {submissionMessage && (
                  <div className={`alert ${submissionMessage.includes("Error") ? "alert-danger" : "alert-success"} mb-3 alert-dismissible`}>
                    {submissionMessage}
                    <button type="button" className="btn-close" onClick={() => setSubmissionMessage("")}></button>
                  </div>
                )}
                {questions2.length > 0 ? (
                  <>
                    <div className="mb-3 p-3 border rounded">
                      <p>
                        <strong>Question {currentIndex2 + 1}:</strong> {questions2[currentIndex2].question}
                        {questions2[currentIndex2].marks && (
                          <span className="text-muted"> ({questions2[currentIndex2].marks} marks)</span>
                        )}
                      </p>
                      <div className="d-flex flex-column">
                        {questions2[currentIndex2].options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            className={`btn my-1 text-start ${selectedAnswers2[currentIndex2] === option
                              ? option === questions2[currentIndex2].answer
                                ? "btn-success"
                                : "btn-danger"
                              : "btn-outline-secondary"
                              }`}
                            onClick={() => selectAnswer2(currentIndex2, option)}
                            disabled={currentIndex2 in selectedAnswers2 || completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {selectedAnswers2[currentIndex2] && (
                        <div className="mt-2">
                          {selectedAnswers2[currentIndex2] === questions2[currentIndex2].answer ? (
                            <p className="text-success">Correct!</p>
                          ) : (
                            <p className="text-danger">
                              Incorrect. The correct answer is: <strong>{questions2[currentIndex2].answer}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-secondary"
                        onClick={handleQuizPrev2}
                        disabled={currentIndex2 === 0}
                      >
                        Previous
                      </button>
                      <span>
                        Question {currentIndex2 + 1} of {questions2.length}
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={handleQuizNext2}
                        disabled={currentIndex2 === questions2.length - 1}
                      >
                        Next
                      </button>
                    </div>
                    {Object.keys(selectedAnswers2).length === questions2.length && (
                      <button
                        onClick={submitQuiz2}
                        disabled={completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id)}
                        className="btn btn-primary w-100 mt-3"
                        style={{
                          opacity: completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id) ? 0.6 : 1,
                          cursor: completedQuizesList.some(q => q.quizId === quizMetadata.quiz2Id) ? "not-allowed" : "pointer",
                        }}
                      >
                        Submit Quiz
                      </button>
                    )}
                    {completedQuizesList.length > 0 ? (
                      <div>
                        <h2 className="text-lg mb-2">Completed Quizzes</h2>
                        <ul className="space-y-2">
                          {completedQuizesList
                            .filter(quiz => quiz.quizId === quizMetadata.quiz2Id)
                            .map((quiz, index) => (
                              <li key={quiz.quizId || index} className="p-2 border rounded-md shadow">
                                <p><strong>Quiz Attempt:</strong> {quiz.attempt}</p>
                                <p><strong>Score:</strong> {quiz.score} / {quiz.totalMarks}</p>
                                <p><strong>Date:</strong> {quiz.date}</p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : (
                      <p>No quizzes completed yet.</p>
                    )}
                    {attempts2.length > 0 && (
                      <div className="mt-4">
                        <h5>Attempt History</h5>
                        <ul className="list-group">
                          {attempts2.map((attempt, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between">
                              <span>Attempt #{attempt.attemptNumber}</span>
                              <span>
                                {attempt.totalCorrect}/{attempt.totalQuestions} correct ({attempt.score}/{attempt.totalMarks} marks)
                              </span>
                              <small className="text-muted">{attempt.date}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p>{questions2.length === 0 ? "No questions available" : "Loading questions..."}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="card-body">
                  <h5 className="card-title">{videos[selectedVideo]?.title || "Untitled Video"}</h5>
                <video
  ref={videoRef}
  width="100%"
  height="400"
  controls
  src={videos[selectedVideo]?.videoUrl || ""}
  type="video/mp4"
  onTimeUpdate={handleVideoProgress}
  onEnded={handleVideoEnded}
    onSeeking={handleSeeking}
>
  Sorry, your browser doesn't support embedded videos.
</video>
                  <div className="mt-3 p-3 bg-light">
                    <h6><strong>Description:</strong></h6>
                    <p>{videos[selectedVideo]?.text_content || "No description available."}</p>
                  </div>

                </div>
                <div className="card-footer d-flex justify-content-between mt-2">
                  <button className="btn btn-danger" onClick={handlePrevious} disabled={selectedVideo === 0}>
                    Previous
                  </button>
                  {/* <button className="btn btn-success" onClick={markAsCompleted}>
                    Mark as Completed
                  </button> */}
                  <button className="btn btn-success" onClick={handleNext} disabled={selectedVideo === videos.length - 1}>
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center">No videos available</p>
      )}
    </div>
  );
};

export default CourseContent;