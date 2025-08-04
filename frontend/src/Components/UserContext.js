import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

   useEffect(() => {
    if (user?.userId) {
        refreshUserProfile(user.userId);
    }
}, [user?.userId]);  

    const refreshUserProfile = (userId) => {
    axios.get(`http://localhost/backend/api/getProfilePic.php?user_id=${userId}`)
        .then(response => {
            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    name: response.data.user.name || user.name,
                    profile_pic: response.data.user.profile_pic || user.profile_pic,
                    profile_pic_url: response.data.user.profile_pic_url || user.profile_pic_url,
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        })
        .catch(error => console.error('Error fetching user:', error));
};


    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateUser, refreshUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
