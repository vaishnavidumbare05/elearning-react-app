// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import AssessmentPage from "./AssessmentPage2";

const AssessmentPage2Wrapper = () => {
  const { courseId } = useParams();

  return <AssessmentPage currentCourseId={courseId} />;
};

export default AssessmentPage2Wrapper;
