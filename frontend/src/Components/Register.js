import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import "./Register.css";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch('http://localhost/backend/api/register.php', {
                method: 'POST',
                body: new URLSearchParams({
                    name: name,
                    email: email,
                    password: password,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = await response.json();

            if (data.success) {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setError('An unexpected error occurred.');
        }
    };

    return (
        <section className="background-radial-gradient overflow-hidden">
            <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                <div className="row gx-lg-5 align-items-center mb-5">
                    <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                        <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                            Join Us Now <br />
                            <span style={{ color: 'hsl(218, 81%, 75%)' }}>Create your account</span>
                        </h1>
                        <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                            Unlock access to our courses and resources by signing up today.
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
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="name">
                                            Full Name
                                        </label>
                                    </div>

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

                                    <div className="form-outline mb-4">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <label className="form-label" htmlFor="confirmPassword">
                                            Confirm Password
                                        </label>
                                    </div>

                                    {error && <p className="text-danger">{error}</p>}
                                    {success && <p className="text-success">{success}</p>}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block mb-4"
                                    >
                                        Sign up
                                    </button>

                                    <div className="text-center">
                                        <p>
                                            Already have an account?{' '}
                                            <a href="#!" onClick={() => navigate('/login')}>
                                                Log in
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

export default Register;
