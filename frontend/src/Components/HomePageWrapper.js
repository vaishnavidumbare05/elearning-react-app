// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";

const HomePageWrapper = () => {
  const { courseId } = useParams();

  return <HomePage currentCourseId={courseId} />;
};

export default HomePageWrapper;
