import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link here
import { useUser } from './UserContext'; // Correct import path for UserContext
import logo from '../img/logo.png';

const Navbar = ({ isAuthenticated, onLogout, user }) => {
    const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="Company Logo" width="60" height="60" />
                    <span className='fs-5 ms-2 nav-item'>Syntax School</span>
                </Link>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mb-2 mb-lg-0">
                        <li className="nav-item fs-5">
                            <Link className="nav-link active" to="/">Home</Link>
                        </li>
                        <li className="nav-item fs-5">
                            <Link className="nav-link" to="/courses">Courses</Link>
                        </li>
                    </ul>
                </div>

                <div className="d-flex align-items-center">
                    {!isAuthenticated ? (
                        <Link className="btn btn-primary" to="/login">Login</Link>
                    ) : (
                        <div
                            className="d-flex align-items-center"
                            onMouseEnter={() => setIsAvatarHovered(true)}
                            onMouseLeave={() => setIsAvatarHovered(false)}
                        >
                            <img
  src={user?.profile_pic_url ? `${user.profile_pic_url}?t=${Date.now()}` : '../img/avatar.png'}
  alt="User Avatar"
  width="40"
  height="40"
  className="rounded-circle"
/>
                            {isAvatarHovered && (
                                <div className="dropdown-menu show" aria-labelledby="avatarDropdown" style={{ position: 'absolute', top: '45px', right: '10px' }}>
                                    <Link className="dropdown-item" to="/profile">Profile Settings</Link>
                                    <Link className="dropdown-item" to="/dashboard">Dashboard</Link>
                                    <button className="dropdown-item" onClick={onLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

