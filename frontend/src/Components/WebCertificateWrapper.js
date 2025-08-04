// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import WebCertificate from "./WebCertificate";

const WebCertificateWrapper = () => {
  const { courseId } = useParams();

  return <WebCertificate currentCourseId={courseId} />;
};

export default WebCertificateWrapper;
