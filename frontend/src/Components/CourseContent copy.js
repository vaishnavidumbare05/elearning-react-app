import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import apiClient from "../api/apiClient";
import axios from "axios";
import { useContext } from "react";
import { useUser } from './UserContext'; // path may vary



const CourseContent = ({ currentCourseId }) => {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [videos, setVideos] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [output, setOutput] = useState("");
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [showQuizzes2, setShowQuizzes2] = useState(false); // New state for second quiz
  const [questions, setQuestions] = useState([]);
  const [questions2, setQuestions2] = useState([]); // New state for second quiz questions
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0); // New state for second quiz current index
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedAnswers2, setSelectedAnswers2] = useState({}); // New state for second quiz answers
  const [score, setScore] = useState(null);
  const [score2, setScore2] = useState(null); // New state for second quiz score
  const [attempts, setAttempts] = useState([]);
  const [attempts2, setAttempts2] = useState([]); // New state for second quiz attempts
  const [allVideosCompleted, setAllVideosCompleted] = useState(false);
  const [quiz1Attempted, setQuiz1Attempted] = useState(false);
  const [quiz1AttemptedOnce, setQuiz1AttemptedOnce] = useState(false);
  const [unlockQuiz2, setUnlockQuiz2] = useState(false);
  const { userId } = useUser(); // ✅ use your context hook
  const [inProgressLectures, setInProgressLectures] = useState([]);
const [completedLectures, setCompletedLectures] = useState([]);

  
  
  
  


  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiClient.get("http://localhost/backend/api/fetch-videos.php");
        console.log(response.data);
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
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime > lastTimeRef.current + 0.5) {
        video.currentTime = lastTimeRef.current;
      } else {
        lastTimeRef.current = video.currentTime;
      }
    };

    const handleSeeking = () => {
      if (video.currentTime > lastTimeRef.current + 0.5) {
        video.currentTime = lastTimeRef.current;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeking", handleSeeking);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleSeeking);
    };
  }, [selectedVideo]);

  useEffect(() => {
    console.log('Selected Video:', selectedVideo);
    console.log('Code Snippet:', videos[selectedVideo]?.code_snippet);
    setCodeSnippet(videos[selectedVideo]?.code_snippet || "No code snippet available.");
  }, [selectedVideo, videos]);




  const handleTryItYourself = async () => {
    if (!codeSnippet || codeSnippet === "No code snippet available.") {
      alert("No code snippet available to execute.");
      return;
    }

    try {
      console.log("Sending code:", codeSnippet);
      const response = await axios.post('http://localhost/backend/api/execute-code.php', {
        code: codeSnippet
      });

      console.log('Backend Response:', response);

      if (response.data && response.data.output) {
        setOutput(response.data.output);
      } else {
        setOutput("No output returned from backend.");
      }
    } catch (error) {
      console.error("Error executing code:", error);
      if (error.response) {
        console.error("Backend Error Response:", error.response.data);
        setOutput(`Backend Error: ${error.response.data}`);
      } else {
        setOutput("Error executing code.");
      }
    }
  };
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
          // 🔄 Normalize ObjectId strings (if needed)
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
  
    // 🆔 Handle ObjectId format
    const lectureId = typeof video._id === "object" && video._id.$oid
      ? video._id.$oid
      : video._id;
  
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;
  
    if (!userId || !currentCourseId) {
      console.error("Missing user ID or course ID");
      return;
    }
  
    // Log the data being sent to the backend
  console.log("Sending to backend:", {
    userId: userId,
    courseId: currentCourseId,
    lectureId: lectureId,
  });
    try {
      const response = await axios.post("http://localhost/backend/api/mark-lecture-completed.php", {
        userId,
        courseId: currentCourseId,
        lectureId
      });
  
      if (response.data?.success) {
        console.log("✅ Lecture marked as completed successfully");
         // Log the updated status and data
     
  
        // ⏱️ Update completed lectures state
        setCompletedLectures(prev => {
          if (!prev.includes(lectureId)) {
            return [...prev, lectureId];
          }
          return prev;
        });
  
        // 🧹 Clean up from in-progress
        setInProgressLectures(prev => prev.filter(id => id !== lectureId));
      } else {
        console.error("❌ Failed to mark lecture as completed:", response.data);
      }
    } catch (error) {
      console.error("Error marking lecture as completed:", error);
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


  // Modify your quiz button click handlers
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
      if (!videos.every(v => v.status === "completed"))
        messages.push("Complete all videos");
      if (attempts.length !== 1)
        messages.push("Attempt Quiz 1 exactly once");

      alert(`Unlock Quiz 2 by:\n- ${messages.join("\n- ")}`);
      return;
    }
    setShowQuizzes2(true);
    setShowQuizzes(false);
  };
  //to check video are completed or not
  // Track video completion status
  useEffect(() => {
    setAllVideosCompleted(videos.length > 0 &&
      videos.every(v => v.status === "completed"));
  }, [videos]);

  // Track quiz attempts
  useEffect(() => {
    setQuiz1AttemptedOnce(attempts.length === 1);
  }, [attempts]);

  // Combine conditions for Quiz 2
  useEffect(() => {
    setUnlockQuiz2(allVideosCompleted && quiz1AttemptedOnce);
  }, [allVideosCompleted, quiz1AttemptedOnce]);


  // Fetch questions when quiz is opened
  useEffect(() => {
    if (showQuizzes) {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get("http://localhost/backend/api/fetch-questions.php");
          console.log("API Response:", response.data);

          // Ensure we have questions array even if response structure varies
          const questionsData = response.data.questions || response.data || [];
          setQuestions(Array.isArray(questionsData) ? questionsData : []);

          // Reset quiz state when fetching new questions
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

  // Fetch questions for second quiz
  useEffect(() => {
    if (showQuizzes2) {
      const fetchQuestions2 = async () => {
        try {
          const response = await axios.get("http://localhost/backend/api/fetch-questions2.php"); // Different endpoint
          console.log("API Response:", response.data);

          // Ensure we have questions array even if response structure varies
          const questionsData = response.data.questions || response.data || [];
          setQuestions2(Array.isArray(questionsData) ? questionsData : []);

          // Reset quiz state when fetching new questions
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


  // Load attempts from localStorage when component mounts
  useEffect(() => {
    const storedAttempts = JSON.parse(localStorage.getItem("quizAttempts")) || [];
    const storedAttempts2 = JSON.parse(localStorage.getItem("quizAttempts2")) || [];
    setAttempts(storedAttempts);
    setAttempts2(storedAttempts2);
  }, []);

  // Save attempt to localStorage
  const saveAttempt = (score, totalMarks) => {
    const newAttempt = {
      score,
      totalMarks,
      date: new Date().toLocaleString(),
      attemptNumber: attempts.length + 1
    };
    const updatedAttempts = [...attempts, newAttempt];
    localStorage.setItem("quizAttempts", JSON.stringify(updatedAttempts));
    setAttempts(updatedAttempts);
  };

  // Save attempt for second quiz
  const saveAttempt2 = (score, totalMarks) => {
    const newAttempt = {
      score,
      totalMarks,
      date: new Date().toLocaleString(),
      attemptNumber: attempts2.length + 1
    };
    const updatedAttempts = [...attempts2, newAttempt];
    localStorage.setItem("quizAttempts2", JSON.stringify(updatedAttempts));
    setAttempts2(updatedAttempts);
  };

  // Select answer for first quiz
  const selectAnswer = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers)) {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
    }
  };

  // Select answer for second quiz
  const selectAnswer2 = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers2)) {
      setSelectedAnswers2({ ...selectedAnswers2, [questionIndex]: option });
    }
  };


  // First Quiz Submission (Modified)
  // First Quiz Submission (Modified)
  const submitQuiz = () => {
    if (attempts.length >= 1) {
      alert("Only one attempt allowed for Quiz 1");
      return;
    }

    let correctCount = 0;
    let totalCorrect = 0; // New variable to count correct answers
    let totalMarks = 0;

    questions.forEach((q, index) => {
      totalMarks += q.marks || 1;
      if (selectedAnswers[index] === q.answer) {
        correctCount += q.marks || 1;
        totalCorrect++; // Increment correct answer count
      }
    });

    const newAttempt = {
      score: correctCount,
      totalMarks,
      totalCorrect, // Store count of correct answers
      totalQuestions: questions.length, // Store total number of questions
      date: new Date().toLocaleString(),
      attemptNumber: 1 // Hardcoded as first/only attempt
    };

    const updatedAttempts = [newAttempt]; // Only store one attempt
    localStorage.setItem("quizAttempts", JSON.stringify(updatedAttempts));
    setAttempts(updatedAttempts);
    setScore(correctCount);
    setUnlockQuiz2(allVideosCompleted && updatedAttempts.length === 1);

    fetch("http://localhost/backend/api/update_quiz_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz: "quiz1" })
    })
      .then(res => res.json())
      .then(data => console.log("Quiz 1 status updated:", data))
      .catch(err => console.error("Error updating Quiz 1 status:", err));
  };
  // Second Quiz Submission (Modified)
  const submitQuiz2 = () => {
    if (attempts2.length >= 1) {
      alert("Only one attempt allowed for Quiz 2");
      return;
    }

    let correctCount = 0;
    let totalCorrect = 0; // New variable to count correct answers
    let totalMarks = 0;

    questions2.forEach((q, index) => {
      totalMarks += q.marks || 1;
      if (selectedAnswers2[index] === q.answer) {
        correctCount += q.marks || 1;
        totalCorrect++; // Increment correct answer count
      }
    });

    const newAttempt = {
      score: correctCount,
      totalMarks,
      totalCorrect, // Store count of correct answers
      totalQuestions: questions2.length, // Store total number of questions
      date: new Date().toLocaleString(),
      attemptNumber: 1
    };

    const updatedAttempts = [newAttempt];
    localStorage.setItem("quizAttempts2", JSON.stringify(updatedAttempts));
    setAttempts2(updatedAttempts);
    setScore2(correctCount);

    fetch("http://localhost/backend/api/update_quiz_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz: "quiz2" })
    })
      .then(res => res.json())
      .then(data => console.log("Quiz 2 status updated:", data))
      .catch(err => console.error("Error updating Quiz 2 status:", err));
  };


  // Navigation for first quiz
  const handleQuizPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleQuizNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // Navigation for second quiz
  const handleQuizPrev2 = () => {
    if (currentIndex2 > 0) setCurrentIndex2(currentIndex2 - 1);
  };

  const handleQuizNext2 = () => {
    if (currentIndex2 < questions2.length - 1) setCurrentIndex2(currentIndex2 + 1);
  };

  {/* Add this where you display quiz questions */ }
  {
    attempts.length > 0 && (
      <div className="alert alert-info mt-3">
        <i className="bi bi-info-circle"></i> You've completed your one attempt at Quiz 1
      </div>
    )
  }

  {
    attempts2.length > 0 && (
      <div className="alert alert-info mt-3">
        <i className="bi bi-info-circle"></i> You've completed your one attempt at Quiz 2
      </div>
    )
  }
  // // Reattempt quizzes
  // const reattemptQuiz = () => {
  //   setSelectedAnswers({});
  //   setScore(null);
  //   setCurrentIndex(0);
  // };

  // const reattemptQuiz2 = () => {
  //   setSelectedAnswers2({});
  //   setScore2(null);
  //   setCurrentIndex2(0);
  // };

    return (
      <div className="container mt-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/courses">Courses</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/python-programming">python programming</Link>
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

        if (
          !completedLectures.includes(lectureId) &&
          !inProgressLectures.includes(lectureId)
        ) {
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
    className={`list-group-item text-center ${allVideosCompleted ? 'bg-warning' : 'bg-secondary'} text-dark mt-2`}
    style={{
      cursor: allVideosCompleted ? "pointer" : "not-allowed",
      opacity: attempts.length > 0 ? 0.7 : 1
    }}
    onClick={handleQuiz1Click}
    title={attempts.length > 0 ? "Quiz already completed" : ""}
  >
    Quizzes Model1
    {!allVideosCompleted && <i className="bi bi-lock ms-2"></i>}
    {attempts.length > 0 && <i className="bi bi-check-circle ms-2 text-success"></i>}
  </li>

  <li
    className={`list-group-item text-center ${unlockQuiz2 ? 'bg-info' : 'bg-secondary'} text-dark mt-2`}
    style={{
      cursor: unlockQuiz2 ? "pointer" : "not-allowed",
      opacity: attempts2.length > 0 ? 0.7 : 1
    }}
    onClick={handleQuiz2Click}
    title={
      !unlockQuiz2 ? "Complete requirements to unlock" :
      attempts2.length > 0 ? "Quiz already completed" : ""
    }
  >
    Quizzes Model2
    {!unlockQuiz2 && <i className="bi bi-lock ms-2"></i>}
    {attempts2.length > 0 && <i className="bi bi-check-circle ms-2 text-success"></i>}
    {unlockQuiz2 && attempts2.length === 0 && <i className="bi bi-unlock ms-2 text-success"></i>}
  </li>
</ul>

            </div>
          </div>

          <div className="col-md-8 d-flex flex-column mt-3 mt-md-0">
            {showQuizzes ? (
              // First quiz UI
              <div className="card-body">
                <h5 className="mb-3">Quiz Section - Model 1</h5>

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
                            disabled={currentIndex in selectedAnswers}
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
                        className="btn btn-primary w-100 mt-3"
                        onClick={submitQuiz}
                      >
                        Submit Quiz
                      </button>
                    )}

                    {score !== null && (
                      <div className="alert alert-info mt-3">
                        <h5>Your Score: {score} / {attempts[attempts.length - 1]?.totalMarks || questions.reduce((sum, q) => sum + (q.marks || 1), 0)}</h5>
                      </div>
                    )}

                    {/* <button
                      className="btn btn-warning w-100 mt-3"
                      onClick={reattemptQuiz}
                    >
                      Reattempt Quiz
                    </button> */}

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
              // Second quiz UI
              <div className="card-body">
                <h5 className="mb-3">Quiz Section - Model 2</h5>

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
                            disabled={currentIndex2 in selectedAnswers2}
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
                        className="btn btn-primary w-100 mt-3"
                        onClick={submitQuiz2}
                      >
                        Submit Quiz
                      </button>
                    )}

                    {score2 !== null && (
                      <div className="alert alert-info mt-3">
                        <h5>Your Score: {score2} / {attempts2[attempts2.length - 1]?.totalMarks || questions2.reduce((sum, q) => sum + (q.marks || 1), 0)}</h5>
                      </div>
                    )}

                    {/* <button
                      className="btn btn-warning w-100 mt-3"
                      onClick={reattemptQuiz2}
                    >
                      Reattempt Quiz
                    </button> */}

                    {attempts2.length > 0 && (
                      <div className="mt-4">
                        <h5>Attempt History</h5>
                        <ul className="list-group">
                          {attempts2.map((attempt, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between">
                              <span>Attempt #{attempt.attemptNumber}</span>
                              <span>
                                {attempt.totalCorrect}/{attempt.totalQuestions} correct Answer ({attempt.score}/{attempt.totalMarks} marks)
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
              // Video content
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
                  >
                    Sorry, your browser doesn't support embedded videos.
                  </video>
                  <div className="mt-3 p-3 bg-light">
                    <h6><strong>Description:</strong></h6>
                    <p>{videos[selectedVideo]?.text_content || "No description available."}</p>
                  </div>
                  <div className="container mt-4">
                    <h6><strong>Code Snippet:</strong></h6>
                    <textarea
                      value={videos[selectedVideo]?.code_snippet || "No code snippet available."}
                      readOnly
                      style={{ width: "100%", height: "150px" }}
                    />
                    <button className="btn btn-primary mt-2" onClick={handleTryItYourself}>
                      Try It Yourself
                    </button>

                    {output && (
                      <div className="mt-4">
                        <h6><strong>Output:</strong></h6>
                        <pre>{output}</pre>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between mt-2">
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