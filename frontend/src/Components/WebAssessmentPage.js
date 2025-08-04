import React, { useEffect, useState , useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardTitle } from "reactstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";
import { useUser } from './UserContext';



const AssessmentPage = ({currentCourseId}) => {
    const { id } = useParams();
    const navigate = useNavigate();
     
       const [showQuizzes, setShowQuizzes] = useState(false);
       
       const [questions, setQuestions] = useState([]);
      
       const [currentIndex, setCurrentIndex] = useState(0);
      
       const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
       
      
      
     
       
       const { userId } = useUser();
      
       const [completedQuizesList, setCompletedQuizesList] = useState([]);
       const [submissionMessage, setSubmissionMessage] = useState("");
       const [quizMetadata, setQuizMetadata] = useState({ quiz1Id: null, quiz2Id: null }); // New state for quiz IDs
     
   
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
    useEffect(() => {
      const fetchQuizMetadata = async () => {
        try {
          // Fetch Quiz 1 metadata
          const quiz1Response = await axios.get("http://localhost/backend/api/fetch-web-questions.php");
          const quiz1Questions = quiz1Response.data.questions || quiz1Response.data || [];
          const quiz1Id = quiz1Questions[0]?.id || null;
  
          // Fetch Quiz 2 metadata
         
          setQuizMetadata({ quiz1Id });
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
useEffect(() => {
    
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
       }
    fetchQuestions();
  }, [showQuizzes]);
   const selectAnswer = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers)) {
      setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
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
        
        setSelectedAnswers({});
        setCurrentIndex(0);
  
        await refreshCompletedQuizzes(userId, currentCourseId);
      } catch (error) {
        console.error("Error saving quiz attempt:", error.response?.data || error.message);
        setSubmissionMessage("Error submitting quiz. Please try again.");
      }
    };
    const handleQuizPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleQuizNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };
  

return(
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
                   
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p>{questions.length === 0 ? "No questions available" : "Loading questions..."}</p>
                  </div>
                )}
              </div>
          
);
 };
export default AssessmentPage;
