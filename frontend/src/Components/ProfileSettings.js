import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "./UserContext"; 

const ProfileSettings = () => {
    const { user, updateUser, refreshUserProfile } = useUser();
    const [name, setName] = useState(user ? user.name : "");
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    

   useEffect(() => {
    let activeUser = user;

    if (!user) {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                activeUser = JSON.parse(storedUser);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
        }
    }

    if (activeUser) {
        setName(activeUser.name || "");
        const profileUrl = activeUser.profile_pic_url
            ? `${activeUser.profile_pic_url}?t=${Date.now()}`
            : '/img/avatar.png';
        setPreview(profileUrl);
    } else {
        setPreview('/img/avatar.png');
    }
}, [user]);



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log("handleFileChange: selected file:", file);
        if (!file) return;

        setProfilePic(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            console.log("FileReader result (preview):", reader.result);
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsUpdating(true);

    console.log("📤 Submitting profile update...");

    const formData = new FormData();
    formData.append("user_id", user.userId);
    formData.append("name", name);
    if (profilePic) {
        formData.append("profile_pic", profilePic);
        console.log("🖼️ Adding profile_pic to formData:", profilePic.name);
    }

   try {
    const response = await axios.post(
        "http://127.0.0.1/backend/api/updateProfile.php",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true
        }
    );

    console.log("✅ API Response:", response.data);

    // Validate if the response is an object and has `success` true
    if (response.data && typeof response.data === "object" && response.data.success) {
        const updatedUser = {
            ...user,
            name: response.data.user.name || name,
            profile_pic: response.data.user.profile_pic || user.profile_pic,
            profile_pic_url: response.data.user.profile_pic_url || user.profile_pic_url
        };

        const imageUrl = updatedUser.profile_pic
            ? `http://localhost/backend/uploads/profile_pics/${updatedUser.profile_pic}?t=${Date.now()}`
            : '/img/avatar.png';

        console.log("Updated profile image URL:", imageUrl);
        console.log("Updating localStorage with:", updatedUser);

        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser); // update context
        refreshUserProfile(user.userId); // re-fetch profile pic with timestamp

        setPreview(imageUrl);
        setSuccessMessage("Profile updated successfully!");
        setProfilePic(null);
    } else {
        console.error("❌ Invalid response format or update failed:", response.data);
        setError(response.data?.error || "Profile update failed");
    }
} catch (err) {
    console.error("Update error:", err);
    setError(err.response?.data?.error || "An error occurred while updating profile");
} finally {
    setIsUpdating(false);
}

 }

    const handlePasswordChange = async () => {
        console.log("Changing password...");
        if (newPassword !== confirmPassword) {
            console.error("Password mismatch!");
            setError("New passwords don't match");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost/backend/api/change_password.php",
                {
                    user_id: user.userId,
                    old_password: oldPassword,
                    new_password: newPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Password change response:", response.data);

            if (response.data.success) {
                setSuccessMessage("Password changed successfully");
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
            } else {
                console.error("Failed password change:", response.data);
                setError(response.data.error || "Failed to change password");
            }
        } catch (err) {
            console.error("Error changing password:", err);
            setError(err.response?.data?.error || "An error occurred while changing password");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Profile Settings</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <div className="text-center mb-3">
                <img
                    src={preview || '/img/avatar.png'}
                    alt="Profile"
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #ddd'
                    }}
                    onError={(e) => {
                        console.error("Image failed to load:", preview);
                        e.target.src = '/img/avatar.png';
                    }}
                />

            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => {
                            console.log("Name changed:", e.target.value);
                            setName(e.target.value);
                        }}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                        jpg, png jpeg or GIF (Max 5MB)
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            console.log("Opening password change modal");
                            setShowPasswordModal(true);
                        }}
                        className="d-block"
                    >
                        Change Password
                    </Button>
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
            </Form>

            <Modal show={showPasswordModal} onHide={() => {
                console.log("Closing password modal");
                setShowPasswordModal(false);
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Old Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={oldPassword}
                                onChange={(e) => {
                                    console.log("Old password input");
                                    setOldPassword(e.target.value);
                                }}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    console.log("New password input");
                                    setNewPassword(e.target.value);
                                }}
                                required
                                minLength="6"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    console.log("Confirm password input");
                                    setConfirmPassword(e.target.value);
                                }}
                                required
                                minLength="6"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        console.log("Cancel password change");
                        setShowPasswordModal(false);
                    }}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePasswordChange}>
                        Update Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProfileSettings;
