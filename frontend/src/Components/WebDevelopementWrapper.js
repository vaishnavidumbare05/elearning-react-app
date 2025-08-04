// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import WebDevelopement from "./WebDevelopement";

const WebDevelopementWrapper = () => {
  const { courseId } = useParams();

  return <WebDevelopement currentCourseId={courseId} />;
};

export default WebDevelopementWrapper;
