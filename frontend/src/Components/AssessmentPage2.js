import React, { useEffect, useState , useRef} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardTitle } from "reactstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";
import { useUser } from './UserContext';

// const shuffleArray = (array) => {
//     let shuffledArray = [...array];
//     for (let i = shuffledArray.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
//     }
//     return shuffledArray;
// };

const AssessmentPage = ({currentCourseId}) => {
    const { id } = useParams();
    const navigate = useNavigate();
     
      
       
        const [showQuizzes2, setShowQuizzes2] = useState(false);
        const [questions, setQuestions] = useState([]);
        const [questions2, setQuestions2] = useState([]);
        const [currentIndex2, setCurrentIndex2] = useState(0);
        const [selectedAnswers2, setSelectedAnswers2] = useState({});
        const [score2, setScore2] = useState(null);
        const { userId } = useUser();
        const [completedQuizesList, setCompletedQuizesList] = useState([]);
        const [submissionMessage, setSubmissionMessage] = useState("");
        const [quizMetadata, setQuizMetadata] = useState({ quiz1Id: null, quiz2Id: null }); // New state for quiz IDs
     
    // useNavigate hook for navigation
    // const [assessments, setAssessments] = useState([]);
    // const [selectedAnswers, setSelectedAnswers] = useState({});
    // const [score, setScore] = useState(0);
    // const [totalQuestions, setTotalQuestions] = useState(0);
    // const [resultSummary, setResultSummary] = useState('');
    // const [incorrectAnswers, setIncorrectAnswers] = useState({});
    // const [isSubmitted, setIsSubmitted] = useState(false);

    // useEffect(() => {
    //     console.log("Fetching assessment with ID:", id); // Debug
    //     fetch(`http://localhost/backend/api/fetch_assessment.php?id=${id}`)
    //         .then((response) => response.json())
    //         .then((data) => {
    //             if (data && Array.isArray(data) && data.length > 0) {
    //                 setAssessments(shuffleArray(data));
    //                 setTotalQuestions(data.length);
    //             } else {
    //                 console.error("Assessment not found");
    //             }
    //         })
    //         .catch((error) => console.error("Error fetching assessment data:", error));
    // }, [id]);

    // useEffect(() => {
//         console.log("Fetching assessment with ID:", id);
//         fetch(`http://localhost/backend/api/fetch_assessment.php?id=${id}`)
//             .then((response) => response.json())
//             .then((data) => {
//                 console.log("Backend response:", data); // Log the response
//                 if (data && !data.error) {
//                     // Convert object to array for uniform processing
//                     const assessmentsArray = Array.isArray(data) ? data : [data];
//                     setAssessments(shuffleArray(assessmentsArray));
//                     setTotalQuestions(assessmentsArray.length);
//                 } else {
//                     console.error("Assessment not found:", data.error);
//                 }
//             })
//             .catch((error) => console.error("Error fetching assessment data:", error));
//     }, [id]);

//     const handleAnswerChange = (assessmentId, selectedOption) => {
//         setSelectedAnswers((prevAnswers) => ({
//             ...prevAnswers,
//             [assessmentId]: selectedOption,
//         }));
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();

//         const payload = {
//             assessmentId: id,
//             selectedAnswers: selectedAnswers,
//         };

//         fetch('http://localhost/backend/api/update_assessment_result.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//         })
//             .then((response) => response.text())
//             .then((data) => {
//                 try {
//                     const jsonData = JSON.parse(data);
//                     if (jsonData.status === "success") {
//                         setScore(jsonData.score);
//                         setResultSummary(jsonData.resultSummary);
//                         setIncorrectAnswers(jsonData.incorrectAnswers);
//                         setIsSubmitted(true);
//                         // Redirect to result page after submission
//                         navigate('/result', {
//                             state: {
//                                 score: jsonData.score,
//                                 resultSummary: jsonData.resultSummary,
//                                 incorrectAnswers: jsonData.incorrectAnswers,
//                                 totalQuestions,
//                             },
//                         });
//                     } else {
//                         alert('Error: ' + jsonData.message);
//                     }
//                 } catch (error) {
//                     console.error('Error parsing JSON:', error);
//                 }
//             });
//     };

//     const progress = (Object.keys(selectedAnswers).length / totalQuestions) * 100;

//     if (assessments.length === 0) {
//         return <div className="container mt-5">Loading...</div>;
//     }

//     return (
//         <div className="container mt-5">
//             <h3 className="text-center">Assessment {id}</h3>
//             <Form onSubmit={handleSubmit}>
//                 {assessments.map((assessment, questionIndex) => {
//                     const assessmentId = assessment._id.$oid || assessment._id.toString();

//                     return (
//                         <Card className="mb-4 shadow-sm" key={assessmentId}>
//                             <CardBody>
//                                 <CardTitle tag="h5" className="mb-3">
//                                     Question {questionIndex + 1}: {assessment.question}
//                                 </CardTitle>

//                                 {assessment.mcq_options.map((option, optionIndex) => {
//                                     const optionKey = `${assessmentId}-${optionIndex}`;
//                                     return (
//                                         <FormGroup key={optionKey} className="mb-2">
//                                             <Input
//                                                 type="radio"
//                                                 id={`option-${assessmentId}-${optionIndex}`}
//                                                 name={`question-${assessmentId}`}
//                                                 value={option}
//                                                 onChange={() => handleAnswerChange(assessmentId, option)}
//                                                 checked={selectedAnswers[assessmentId] === option}
//                                                 disabled={isSubmitted}
//                                             />
//                                             <Label for={`option-${assessmentId}-${optionIndex}`} className="ms-2">
//                                                 {option}
//                                             </Label>
//                                         </FormGroup>
//                                     );
//                                 })}
//                             </CardBody>
//                         </Card>
//                     );
//                 })}

//                 {!isSubmitted && (
//                     <div className="d-flex justify-content-center">
//                         <Button color="primary" size="lg" type="submit" className="px-5">
//                             Submit
//                         </Button>
//                     </div>
//                 )}
//             </Form>
//         </div>
//   );
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
           // Fetch Quiz 2 metadata
        const quiz2Response = await axios.get("http://localhost/backend/api/fetch-questions2.php");
        const quiz2Questions = quiz2Response.data.questions || quiz2Response.data || [];
        const quiz2Id = quiz2Questions[0]?.id || null;

        setQuizMetadata({ quiz2Id });
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
   
      const fetchQuestions2 = async () => {
        try {
          const response = await axios.get("http://localhost/backend/api/fetch-questions2.php");
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
   
  }, [showQuizzes2]);

   const selectAnswer2 = (questionIndex, option) => {
    if (!(questionIndex in selectedAnswers2)) {
      setSelectedAnswers2({ ...selectedAnswers2, [questionIndex]: option });
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
      const response = await axios.post("http://localhost/backend/api/save-completed-quiz.php", newAttempt);
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

  const handleQuizPrev2 = () => {
    if (currentIndex2 > 0) setCurrentIndex2(currentIndex2 - 1);
  };

  const handleQuizNext2 = () => {
    if (currentIndex2 < questions2.length - 1) setCurrentIndex2(currentIndex2 + 1);
  };

  

return(
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
                        <h3 className="text-lg font-semibold mb-2">Completed Quizzes</h3>
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
