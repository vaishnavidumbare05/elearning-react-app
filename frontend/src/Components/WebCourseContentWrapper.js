// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import WebCourseContent from "./WebCourseContent";


const WebCourseContentWrapper = () => {
  const { courseId } = useParams();

  return <WebCourseContent currentCourseId={courseId} />;
};

export default WebCourseContentWrapper;
