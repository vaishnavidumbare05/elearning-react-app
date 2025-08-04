// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import CourseContent from "./CourseContent";

const CourseContentWrapper = () => {
  const { courseId } = useParams();

  return <CourseContent currentCourseId={courseId} />;
};

export default CourseContentWrapper;
