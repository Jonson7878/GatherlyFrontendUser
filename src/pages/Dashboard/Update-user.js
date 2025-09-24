import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { useTheme } from '@mui/material/styles';
import './UpdateUser.css';

const UpdateUserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // eslint-disable-next-line
    const theme = useTheme();

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
    });
    const [alert, setAlert] = useState({ message: "", severity: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAlert({ message: 'Unauthorized: Please log in first.', severity: 'warning' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        let decodedToken;
        try {
            decodedToken = jwtDecode(token);
            if (decodedToken.role !== 'admin') {
                setAlert({ message: 'Access Denied: Only admins can update users.', severity: 'error' });
                setTimeout(() => navigate('/users/dashboard'), 1500);
                return;
            }
            const now = Date.now() / 1000;
            if (decodedToken.exp < now) {
                setAlert({ message: 'Session expired. Please login again.', severity: 'warning' });
                localStorage.removeItem("token");
                setTimeout(() => navigate("/login"), 1500);
                return;
            }
        } catch (error) {
            setAlert({ message: 'Invalid token. Please login again.', severity: 'error' });
            localStorage.removeItem("token");
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:4000/api/managed-users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const { username = '', email = '', role = '' } = response.data.user;
                setUserData({ username, email, password: '', role });
                setLoading(false);
                setAlert({ message: 'User data loaded successfully!', severity: 'success' });
                setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
                const errorMessage = error.response?.data?.message || 'Failed to fetch user data. Please check your token or permissions.';
                setAlert({ message: errorMessage, severity: 'error' });
                setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
            }
        };

        if (id) {
            fetchUserData();
        } else {
            setAlert({ message: 'No user ID provided.', severity: 'error' });
            setTimeout(() => navigate('/users/dashboard'), 1500);
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setAlert({ message: "", severity: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData.username.trim() || !userData.email.trim() || !userData.role.trim()) {
            setAlert({ message: 'All fields are required.', severity: 'error' });
            setTimeout(() => setAlert({ message: '', severity: '' }), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setAlert({ message: 'Authentication required. Please log in.', severity: 'warning' });
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            const payload = {
                username: userData.username,
                email: userData.email,
                password: userData.password || undefined,
                role: userData.role,
            };

            const response = await axios.put(`http://localhost:4000/api/managed-users/update/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAlert({ message: response.data.message || "User updated successfully!", severity: "success" });

            console.log('Updated User:', userData);
            setTimeout(() => {
                setAlert({ message: "", severity: "" });
                navigate("/users/dashboard");
            }, 1500);
        } catch (error) {
            console.error('Error updating user:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update user. Please try again.';
            setAlert({ message: errorMessage, severity: 'error' });
            setTimeout(() => setAlert({ message: "", severity: "" }), 1500);
        }
    };

    if (loading) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="update-user-container">
            <header className="update-user-header">
                <h2>Update User</h2>
            </header>
            {alert.message && (
                <Stack sx={{ width: '100%', mb: 2, fontWeight: 'bold' }}>
                    <Alert
                        severity={alert.severity}
                        sx={{
                            fontWeight: 'bold',
                            color: (theme) => {
                                switch (alert.severity) {
                                    case 'error':
                                        return theme.palette.error.main;
                                    case 'success':
                                        return theme.palette.success.main;
                                    case 'warning':
                                        return theme.palette.warning.main;
                                    case 'info':
                                        return theme.palette.info.main;
                                    default:
                                        return theme.palette.text.primary;
                                }
                            },
                        }}
                        onClose={() => setAlert({ message: "", severity: "" })}
                    >
                        {alert.message}
                    </Alert>
                </Stack>
            )}

            <form className="update-user-form" onSubmit={handleSubmit}>
                <label>Username</label>
                <input type="text" name="username" value={userData.username} onChange={handleChange} />

                <label>Email</label>
                <input type="email" name="email" value={userData.email} onChange={handleChange} />

                <label>Password</label>
                <input type="password" name="password" value={userData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />

                <label>Role</label>
                <select name="role" value={userData.role} onChange={handleChange}>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="guest">Guest</option>
                </select>

                <button type="submit">Update User</button>
            </form>
        </div>
    );
};

export default UpdateUserForm;