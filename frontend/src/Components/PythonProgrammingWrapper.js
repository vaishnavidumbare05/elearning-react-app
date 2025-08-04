// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import PythonProgramming from "./PythonProgramming";

const PythonProgrammingWrapper = () => {
  const { courseId } = useParams();

  return <PythonProgramming currentCourseId={courseId} />;
};

export default PythonProgrammingWrapper;
