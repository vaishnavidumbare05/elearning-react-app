// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import Course_Content from "./Web_Content";

const WebContentWrapper = () => {
  const { courseId } = useParams();

  return <Course_Content currentCourseId={courseId} />;
};

export default  WebContentWrapper;
