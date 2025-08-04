// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import AssessmentPage from "./WebAssessmentPage";

const WebAssessmentPageWrapper = () => {
  const { courseId } = useParams();

  return <AssessmentPage currentCourseId={courseId} />;
};

export default WebAssessmentPageWrapper;
