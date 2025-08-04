// src/Components/CourseContentWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import WebProgressReport from "./WebProgressReport";


const WebProgressReportWrapper = () => {
  const { courseId } = useParams();

  return <WebProgressReport currentCourseId={courseId} />;
};

export default WebProgressReportWrapper;
