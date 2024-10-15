import React, { useState } from 'react';

const SignUp = () => {
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API request logic will be here
        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
            />
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
            />
            <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="business">Business</option>
            </select>
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;
