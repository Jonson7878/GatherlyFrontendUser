import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from '../../config';
import { Alert, Stack } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import '../../App.css';

function UpdateTask() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState({
        taskName: "",
        description: "",
        endDate: "",
    });

    const [alert, setAlert] = useState({ message: "", severity: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setAlert({ message: "You must log in first.", severity: "warning" });
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp < now) {
                setAlert({ message: "Session expired. Please login again.", severity: "warning" });
                localStorage.removeItem("token");
                setTimeout(() => navigate("/login"), 1500);
                return;
            }
        } catch (error) {
            setAlert({ message: "Invalid session. Please log in.", severity: "error" });
            localStorage.removeItem("token");
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        if (id) {
            fetchTaskDetails();
        } else {
            setAlert({ message: "No task ID provided.", severity: "error" });
            setTimeout(() => navigate("/tasks/dashboard"), 1500);
        } // eslint-disable-next-line
    }, [id, navigate]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_BASE}/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const fetchedTask = response.data.task;

            setTask({
                ...fetchedTask,
                endDate: fetchedTask.endDate ? new Date(fetchedTask.endDate).toISOString().split("T")[0] : "",
            });

            setAlert({ message: "Task loaded successfully!", severity: "success" });
            setLoading(false);
            setTimeout(() => {
                setAlert({ message: "", severity: "" });
            }, 1500);
        } catch (error) {
            console.error("Error loading task details:", error);
            setLoading(false);
            const errorMessage = error.response?.data?.message || "Error loading task. Please try again.";
            setAlert({ message: errorMessage, severity: "error" });
            setTimeout(() => {
                setAlert({ message: "", severity: "" });
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else if (error.response?.status === 404) {
                    navigate("/tasks/dashboard");
                }
            }, 3000);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask((prev) => ({ ...prev, [name]: value }));
        setAlert({ message: "", severity: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setAlert({ message: "Authentication required to update task.", severity: "warning" });
                setTimeout(() => navigate("/login"), 1500);
                return;
            }

            const response = await axios.put(
                `${API_BASE}/api/tasks/updatetask/${id}`,
                task,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlert({ message: response.data.message, severity: "success" });
            setTimeout(() => {
                setAlert({ message: "", severity: "" });
                navigate("/tasks/dashboard");
            }, 1500);
        } catch (error) {
            console.error("Error updating task:", error);
            const errorMessage = error.response?.data?.message || "Failed to update task. Please try again.";
            setAlert({ message: errorMessage, severity: "error" });
            setTimeout(() => setAlert({ message: "", severity: "" }), 3000);
        }
    };

    return (
        <div className="task-form-container">
            <h2>Update Task</h2>

            {alert.message && (
                <Stack sx={{ width: "100%", mb: 2 }}>
                    <Alert severity={alert.severity} onClose={() => setAlert({ message: "", severity: "" })}>
                        {alert.message}
                    </Alert>
                </Stack>
            )}

            {loading ? (
                <p>Loading task details...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="taskName">Task Name:</label>
                    <input
                        type="text"
                        id="taskName"
                        name="taskName"
                        value={task.taskName}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={task.description}
                        onChange={handleChange}
                        required
                    ></textarea>

                    <label htmlFor="endDate">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={task.endDate}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Update Task</button>
                </form>
            )}
        </div>
    );
}

export default UpdateTask;