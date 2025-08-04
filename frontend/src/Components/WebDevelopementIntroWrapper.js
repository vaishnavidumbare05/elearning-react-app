// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import Course from "./WebDevelopementIntro";

const WebDevelopementIntroWrapper = () => {
  const { courseId } = useParams();

  return <Course currentCourseId={courseId} />;
};

export default WebDevelopementIntroWrapper;
