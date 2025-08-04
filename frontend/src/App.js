import React from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from './Components/UserContext'; // Import UserContext

// Importing other components
import Navbar from "./Components/Navbar";
import HomePage from "./Components/HomePage";
import Dashboard from "./Components/Dashboard";
import PythonProgramming from "./Components/PythonProgramming";
import WebDevelopement from "./Components/WebDevelopement";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Courses from "./Components/Courses";
import CertificatePage from "./Components/CertificatePage"; // New Certificate Page
import ProfileSettings from './Components/ProfileSettings';
import CourseContentWrapper from "./Components/CourseContentWrapper";
import WebCourseContentWrapper from "./Components/WebCourseContentWrapper";
import PythonProgrammingWrapper from "./Components/PythonProgrammingWrapper";
import PythonProgrammingIntro from "./Components/PythonProgrammingIntro"; // adjust path if needed
import WebDevelopementWrapper from "./Components/WebDevelopementWrapper";
import CertificateWrapper from "./Components/CertificateWrapper";
import WebCertificateWrapper from "./Components/WebCertificateWrapper";
import HomePageWrapper from "./Components/HomePageWrapper";
import WebProgressReportWrapper from "./Components/WebProgressReportWrapper";
import ProgressReportWrapper from "./Components/ProgressReportWrapper";
import WebContentWrapper from "./Components/WebContentWrapper";
import PythonProgrammingIntroWrapper from "./Components/PythonProgrammingIntroWrapper";
import WebDevelopementIntroWrapper from "./Components/WebDevelopementIntroWrapper";
import PythonContentWrapper from "./Components/PythonContentWrapper";
import AssessmentPageWrapper from "./Components/AssessmentPageWrapper";
import AssessmentPage2Wrapper from "./Components/AssessmentPage2Wrapper";
import WebAssessmentPageWrapper from "./Components/WebAssessmentPageWrapper";
import WebAssessmentPage2Wrapper from "./Components/WebAssessmentPage2Wrapper";
import Payment from './Components/Payment'; // adjust path based on your project structure




// ProtectedRoute component to handle authenticated routes
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const navigate = useNavigate();
  const { user, login, logout, updateUser } = useUser(); // Access user context here

  // Handle login
  const handleLogin = (userData) => {
    console.log('Received login data:', userData);
    login(userData); // Set user data in context
    navigate('/'); // Navigate to dashboard after login
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Clear user data from context
    navigate("/"); // Redirect to home after logout
  };

  // Handle profile updates (from ProfileSettings)
  const handleUpdateProfile = (updatedUserData) => {
    updateUser(updatedUserData); // Update the user context with new profile data
    navigate('/profile'); // Optionally, navigate to profile page after update
  };

  return (
    <div className="App">
      <Navbar isAuthenticated={user !== null} onLogout={handleLogout} user={user} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes for Authenticated Users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/homepage/:courseId"
          element={
            <ProtectedRoute>
              <HomePageWrapper />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/python-programming"
          element={
            <ProtectedRoute>
              <PythonProgramming />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/python/:courseId"
          element={
            <ProtectedRoute><PythonProgrammingWrapper />
            </ProtectedRoute>
          } />
           <Route
          path="/course/python-intro/:courseId"
          element={
            <ProtectedRoute><PythonProgrammingIntroWrapper />
            </ProtectedRoute>
          } />

          <Route
          path="/course/python-intro"
          element={
            <ProtectedRoute>
              <PythonProgrammingIntro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-content/:courseId"
          element={
            <ProtectedRoute>
              <CourseContentWrapper />
            </ProtectedRoute>
          }
        />
         <Route
          path="/web-course-content/:courseId"
          element={
            <ProtectedRoute>
              <WebCourseContentWrapper />
            </ProtectedRoute>
          }
        />
         <Route
          path="/course/webdevelopement/:courseId"
          element={
            <ProtectedRoute>
              <WebDevelopementWrapper />
            </ProtectedRoute>
          } />
        <Route
          path="/web-developement"
          element={
            <ProtectedRoute>
              <WebDevelopement />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/course-page/:courseId"
          element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
  path="/payment"
  element={
    <ProtectedRoute>
      <Payment />
    </ProtectedRoute>
  }
/>

        {/* Existing Assessment Page */}
        <Route
          path="/assessment/:courseId"
          element={
            <ProtectedRoute>
              < AssessmentPageWrapper />
            </ProtectedRoute>
          }
        />
         <Route
          path="/assessment2/:courseId"
          element={
            <ProtectedRoute>
              < AssessmentPage2Wrapper />
            </ProtectedRoute>
          }
        />
        <Route
         path="/web/assessment/:courseId"
        element={
        <ProtectedRoute>
       <  WebAssessmentPageWrapper />
         </ProtectedRoute>
}
/>
 <Route
  path="/web/assessment2/:courseId"
        element={
        <ProtectedRoute>
       <  WebAssessmentPage2Wrapper />
         </ProtectedRoute>
}
/>

        {/* Certificate Pages */}
        
        <Route
          path="/certificate/:courseId"
          element={
            <ProtectedRoute>
              <CertificateWrapper />
            </ProtectedRoute>
          }
        />
        
          <Route
          path="/web-certificate/:courseId"
          element={
            <ProtectedRoute>
              <WebCertificateWrapper />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/new-certificate"
          element={
            <ProtectedRoute>
              <CertificatePage />
            </ProtectedRoute>
          }
        />

        {/* Profile settings page with user data */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings user={user} onUpdateProfile={handleUpdateProfile} />
            </ProtectedRoute>
          }
        />

         <Route
        path="/pythonprogrammingintro"
        element={
          <ProtectedRoute>
            <PythonProgrammingIntro />
          </ProtectedRoute>
        }
      />

        {/* Default route for protected pages */}
        <Route
          path="*"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />



        {/* Profile settings page with user data */}
        <Route
          path="/progress-report/:courseId"
          element={
            <ProtectedRoute>
              <ProgressReportWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/web-progress-report/:courseId"
          element={
            <ProtectedRoute>
              <WebProgressReportWrapper />
            </ProtectedRoute>
          }
        />
                <Route
          path="/web-content/:courseId"
          element={
            <ProtectedRoute>
              <WebContentWrapper />
            </ProtectedRoute>
          }
        />
         <Route
          path="/course/webdevelopement-intro/:courseId"
          element={
            <ProtectedRoute>
              <WebDevelopementIntroWrapper />
            </ProtectedRoute>
          }
        />
         <Route
          path="/course/python_content/:courseId"
          element={
            <ProtectedRoute>
              <PythonContentWrapper />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
};

// Wrap the entire App with UserProvider
const AppWithProvider = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default AppWithProvider;