
import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";  // Import the user context
import { jsPDF } from "jspdf";  // Import jsPDF for generating PDF

const CertificatePage = () => {
    const { user } = useUser();  // Get the current user from context
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.email) {
            setError("User data not found. Please log in.");
        }
    }, [user]);

    // PDF Download Function
    const handleDownload = () => {
        const doc = new jsPDF("landscape", "pt", "a4");

        // Set up fonts and styling for PDF
        doc.setFont("times", "normal");

        // Add gradient background
        const gradientHeight = doc.internal.pageSize.height;
        const gradientWidth = doc.internal.pageSize.width;
        const colors = ["#FF7F50", "#FFD700"];  // A vibrant gradient

        for (let i = 0; i < gradientHeight; i++) {
            const color = mixColors(colors[0], colors[1], i / gradientHeight);
            const { r, g, b } = hexToRgb(color);
            doc.setFillColor(r, g, b);
            doc.rect(0, i, gradientWidth, 1, "F");
        }

        // Add Logo to PDF
        const logo = new Image();
        logo.src = '../img/logo.jpg';  // Replace with your logo path

        logo.onload = function () {
            doc.addImage(logo, 'PNG', 30, 30, 100, 60);  // Adjust position and size of the logo

            // Title
            const titleFontSize = 30;
            doc.setFontSize(titleFontSize);
            const title = "Certificate of Completion";
            const titleWidth = doc.getTextWidth(title);
            const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
            doc.text(title, titleX, 120);

            // Body text
            const bodyFontSize = 16;
            doc.setFontSize(bodyFontSize);
            const textLines = [
                "This is to certify that",
                user.name || "Loading...",
                "Has successfully completed the",
                "Web Development",
                `Course Date: ${new Date().toLocaleDateString()}`,
                "Instructor: John Smith"
            ];

            let yPosition = 160;

            // Add text to PDF
            textLines.forEach((line) => {
                const lineWidth = doc.getTextWidth(line);
                const xPosition = (doc.internal.pageSize.width - lineWidth) / 2;
                doc.text(line, xPosition, yPosition);
                yPosition += bodyFontSize + 10;
            });

            // Save the PDF
            doc.save("certificate.pdf");
        };
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg rounded">
                <div className="card-body d-flex flex-column align-items-center text-center">
                    {error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : (
                        <>
                            <h2 className="mb-4 text-success">🎉 Congratulations!</h2>
                            <h4>You have successfully completed the Web Development Course!</h4>
                            <div
                                className="certificate-container mt-4 mb-4"
                                style={{
                                    padding: "40px",
                                    borderRadius: "15px",
                                    background: "linear-gradient(135deg, #FF7F50, #FFD700)", // Gradient background
                                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                                    width: "100%",
                                    maxWidth: "650px",
                                    margin: "0 auto",
                                    textAlign: "center",
                                    minHeight: "450px",
                                    position: "relative",
                                }}
                            >
                                {/* Logo */}
                                <img
                                    src="../img/logo.jpg"  // Replace with your logo path
                                    alt="Logo"
                                    style={{
                                        position: "absolute",
                                        top: "20px",
                                        left: "20px",
                                        width: "100px",
                                    }}
                                />
                                <h5 style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>
                                    Certificate of Completion
                                </h5>
                                <p style={{ fontSize: "18px", color: "#fff" }}>
                                    This is to certify that
                                </p>
                                <h3 style={{ fontWeight: "bold", fontSize: "28px", color: "#fff" }}>
                                    {user.name || "Loading..."}
                                </h3>
                                <p style={{ fontSize: "18px", color: "#fff" }}>Has successfully completed the</p>
                                <h4 style={{ fontSize: "26px", color: "#FF4500" }}>Web Development</h4>
                                <p style={{ fontSize: "18px", color: "#fff" }}>
                                    Course on {new Date().toLocaleDateString()}
                                </p>
                                <p style={{ fontSize: "18px", color: "#fff" }}>Instructor: John Smith</p>
                            </div>

                            {/* Button outside certificate */}
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary mt-4 px-5 py-3"
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    borderRadius: "50px",
                                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                                Download Certificate
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificatePage;

// Helper functions for color mixing and hex/RGB conversion
function mixColors(color1, color2, ratio) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const match = hex.match(/^#([a-f0-9]{6}|[a-f0-9]{3})$/i);
    const hexValue = match ? match[1] : "";
    const r = parseInt(hexValue.substr(0, 2), 16);
    const g = parseInt(hexValue.substr(2, 2), 16);
    const b = parseInt(hexValue.substr(4, 2), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}
