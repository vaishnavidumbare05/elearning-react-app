// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import ProgressReport from "./ProgressReport";

const ProgressReportWrapper = () => {
  const { courseId } = useParams();

  return <ProgressReport currentCourseId={courseId} />;
};

export default ProgressReportWrapper;
