import React, { useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { jsPDF } from 'jspdf';

const Certificate = ({currentCourseId}) => {
    const { user } = useUser();


    const [certificateData, setCertificateData] = useState({
        userName: '',
        courseTitle: '',
        duration: 'Calculating...',
        date: new Date().toLocaleDateString(),
        isLoading: true,
        error: ''
    });
    const certificateRef = useRef(null);
    console.log("User in Certificate.js:", user); // Debugging

    useEffect(() => {
        
        const fetchCertificateData = async () => {
            try {
                console.log("User state before fetching:", user); // Debug user state
        
                if (!user || !user.userId || !user.name) {
                    console.log("User is not properly logged in:", user);
                    throw new Error("Please log in to view certificate");
                }
        
                const payload = JSON.stringify({ userId: user.userId,courseId: currentCourseId } );
                console.log("Fetching certificate for user:", user);
                console.log("Payload sent to backend:", payload);
        
                const response = await fetch('http://localhost/backend/api/get-certificate-data.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: payload
                });
        
                console.log("Raw response status:", response.status);
                const responseText = await response.text();
                console.log("Raw response text:", responseText);
        
                // Check for session or generic fetch issues
                if (response.status === 401) {
                    console.log("Session expired (401)");
                    throw new Error("Session expired. Please log in again.");
                }
        
                if (!response.ok) {
                    console.log("Response not OK. Status:", response.status);
                    throw new Error('Failed to fetch certificate data');
                }
        
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log("Parsed response JSON:", data);
                } catch (parseError) {
                    console.log("Failed to parse JSON from response");
                    throw new Error("Invalid response format (not JSON)");
                }
        
                if (!data.userName || !data.courseTitle || data.totalDuration === undefined) {
                    console.error('Incomplete data received from backend:', data);
                    throw new Error('Certificate data incomplete from server');
                }
        
                setCertificateData({
                    userName: data.userName,
                    courseTitle: data.courseTitle,
                    duration: formatDuration(data.totalDuration),
                    date: data.date || new Date().toLocaleDateString(),
                    isLoading: false,
                    error: ''
                });
        
            } catch (error) {
                console.error("Error caught in fetchCertificateData:", error);
                setCertificateData({
                    userName: '',
                    courseTitle: '',
                    duration: '',
                    date: '',
                    isLoading: false,
                    error: error.message
                });
            }
        };
        
        fetchCertificateData();
        console.log("User in Certificate.js:", user);
        
    }, [user]);

    const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return 'Not specified';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    let result = '';
    if (mins > 0) result += `${mins} min `;
    if (secs > 0) result += `${secs} sec`;

    return result.trim();
};

    const handleDownload = () => {
        if (!certificateData.userName || !certificateData.courseTitle) {
            setCertificateData(prev => ({
                ...prev,
                error: 'Cannot download - certificate data missing'
            }));
            return;
        }
    
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [800, 600] // Exact dimensions matching frontend
        });
    
        const img = new Image();
        img.src = `${process.env.PUBLIC_URL}/img/certificate.png`;
    
        img.onload = () => {
            doc.addImage(img, 'PNG', 0, 0, 800, 600);
    
            // Set font and text color
            doc.setFont("times", "bold");
            doc.setTextColor(0, 0, 0);
    
            // User Name - Position aligned exactly like the webpage
            doc.setFontSize(27);
            doc.text(certificateData.userName, 390, 315, { align: 'center' });
    
            // Course Title Below the User Name
            doc.setFontSize(23);
            doc.text(`"${certificateData.courseTitle}"`, 400, 369, { align: 'center' });
    
            // Duration Positioned Bottom Left
            doc.setFontSize(23);
            doc.text(` ${certificateData.duration}`, 172, 462);
    
            // Date Positioned Below Duration
            doc.text(` ${certificateData.date}`, 158, 492);
    
            // Save the PDF
            doc.save(`${certificateData.userName}_${certificateData.courseTitle.replace(/\s+/g, '_')}_certificate.pdf`);
        };
    
    
    
        if (certificateRef.current) {
            certificateRef.current.focus();
        }
    };
    

    if (certificateData.isLoading) {
        return <div className="text-center mt-5">Loading certificate data...</div>;
    }

    if (certificateData.error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Certificate Error</h4>
                    <p>{certificateData.error}</p>

                    {/* Debug information */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-3 text-muted small">
                            <p>Debug Info:</p>
                            <ul>
                                <li>User ID: {user?._id || 'Not available'}</li>
                                <li>Login Status: {user ? 'Logged In' : 'Not Logged In'}</li>
                                <li>Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}</li>
                            </ul>
                        </div>
                    )}

                    {(!user || !user._id) && (
                        <div className="mt-3">
                            <a href="/login" className="btn btn-primary">Login Again</a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-2">
            <div className="card shadow-lg rounded-3" ref={certificateRef} tabIndex="-1">
                <div className="card-body d-flex flex-column align-items-center text-center">



                    <div className="certificate-container mt-4 mb-4 p-5 position-relative"
                        style={{
                            backgroundImage: `url(${process.env.PUBLIC_URL}/img/certificate.png)`,
                            backgroundSize: 'cover',
                            width: '100%',
                            maxWidth: '800px',
                            height: '600px',
                            margin: '0 auto'
                        }}>

                        <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center"
                            style={{ top: 0, left: 0 }}>

                            {/* User Name Below "Certificate Present To" */}
                            <h2 className="mt-custom" style={{ fontSize: '27px', fontWeight: 'bold', marginTop: '285px' }}>
                                {certificateData.userName}
                            </h2>

                            {/* Empty Line Below the Name */}
                            <p style={{ marginBottom: '2px' }}> &nbsp; </p>

                            {/* Course Title Below the Empty Line */}
                            <h3 className=" " style={{ fontSize: '19px', fontWeight: 'bold' }}>
                                "{certificateData.courseTitle}"
                            </h3>

                            {/* Duration and Date Positioned to the Right */}
                            <div
                                className="w-50 px-5"
                                style={{ position: 'absolute', bottom: '116px', left: '5px' }}>
                                <p style={{ marginLeft: '65px' }}>{certificateData.duration}</p>
                            </div>
                            <div
                                className="w-50 px-5"
                                style={{ position: 'absolute', bottom: '85px', left: '2px' }}>
                                <p style={{ marginLeft: '1px' }}>{certificateData.date}</p>
                            </div>

                        </div>
                    </div>


                    <button onClick={handleDownload} className="btn btn-primary mt-2 px-5 py-3">
                        Download Certificate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Certificate;