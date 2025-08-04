import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate after successful login
import './Login.css';
import { useUser } from './UserContext';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // React Router hook to navigate after login
    const { login } = useUser(); // Use context

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Sending data:', { email, password });  // Log the data

        try {
            const response = await fetch('http://localhost/backend/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Ensure content-type is JSON
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();
            console.log('Response:', data);  // Log the response for debugging
            

            if (data.success) {
                login({ userId: data.user_id, name: data.name, email: data.email, profile_pic:data.profile_pic, profile_pic_url: data.profile_pic_url || null }); // Store user globally
                navigate('/'); // Redirect after login
                console.log('Login successful:', data);

                // Send the necessary user data to the parent (App.js)
                onLogin({
                    userId: data.user_id,   // Send the user id, name, and any other relevant data
                    name: data.name,
                    email: data.email,
                     profile_pic: data.profile_pic,
                    profile_pic_url: data.profile_pic_url || null,
                });

                // Navigate to the dashboard after successful login
                navigate('/');
            } else {
                console.log('Error:', data.error);
                setError(data.error); // Set error in state if any
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An unexpected error occurred.');
        }
    };

    return (
        <section className="background-radial-gradient overflow-hidden">
            <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                <div className="row gx-lg-5 align-items-center mb-5">
                    <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                        <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                            Welcome back <br />
                            <span style={{ color: 'hsl(218, 81%, 75%)' }}>to our platform</span>
                        </h1>
                        <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                            Please log in to access your account and continue exploring our offerings.
                        </p>
                    </div>

                    <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                        <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
                        <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

                        <div className="card-login bg-glass">
                            <div className="card-body px-4 py-5 px-md-5">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-outline mb-4">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="email">
                                            Email address
                                        </label>
                                    </div>

                                    <div className="form-outline mb-4">
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="password">
                                            Password
                                        </label>
                                    </div>

                                    {error && <p className="text-danger">{error}</p>}

                                    <button type="submit" className="btn btn-primary btn-block mb-4">
                                        Log in
                                    </button>

                                    <div className="text-center">
                                        <p>
                                            Don't have an account?{' '}
                                            <a href="#!" onClick={() => navigate('/register')}>
                                                Sign up
                                            </a>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;











