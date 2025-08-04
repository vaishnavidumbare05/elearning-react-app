// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import Course_Content from "./Python_Content";

const PythonContentWrapper = () => {
  const { courseId } = useParams();

  return <Course_Content currentCourseId={courseId} />;
};

export default PythonContentWrapper;
