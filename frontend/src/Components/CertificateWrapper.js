// src/Components/PythonProgrammingWrapper.js
import React from "react";
import { useParams } from "react-router-dom";
import Certificate from "./Certificate";

const CertificateWrapper = () => {
  const { courseId } = useParams();

  return <Certificate currentCourseId={courseId} />;
};

export default CertificateWrapper;
