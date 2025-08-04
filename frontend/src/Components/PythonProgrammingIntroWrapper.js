// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import Course from "./PythonProgrammingIntro";

const PythonProgrammingIntroWrapper = () => {
  const { courseId } = useParams();

  return <Course currentCourseId={courseId} />;
};

export default PythonProgrammingIntroWrapper;
