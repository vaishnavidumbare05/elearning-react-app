// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import AssessmentPage from "./WebAssessmentPage2";

const WebAssessmentPage2Wrapper = () => {
  const { courseId } = useParams();

  return <AssessmentPage currentCourseId={courseId} />;
};

export default WebAssessmentPage2Wrapper;
