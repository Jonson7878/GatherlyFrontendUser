import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Alert, Stack } from "@mui/material";
import "../../App.css";

function CreateTask() {
    const [formData, setFormData] = useState({
        taskName: "",
        description: "",
        assignBy: "",
        assignTo: "",
        priority: "",
        startDate: "",
        endDate: "",
        isCompleted: false,
        isVerified: false,
    });

    const [assignByUsers, setAssignByUsers] = useState([]);
    const [assignToUsers, setAssignToUsers] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ message: "", severity: "" });
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setAlert({message:'You are not authorized. Please log in.', severity:'warning'})
             setTimeout(() => navigate("/login"),1500);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);

            axios
                .get("http://localhost:4000/api/managed-users/users", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    setAssignByUsers(response.data.assignByUsers);
                    setAssignToUsers(response.data.assignToUsers);
                })
                .catch((error) => {
                    console.error("Error fetching users:", error.response?.data || error.message);
                    setAlert({
                        message: error.response?.data?.message || "Failed to load user lists.",
                        severity: "error",
                    });
                });
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            setAlert({message:'Invalid token:',severity:'warning'})
            setTimeout(()=>navigate("/login"));
        }
    }, [navigate, token]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};

        if (userRole !== "admin" && userRole !== "manager") {
            newErrors.permission = "Only admins and managers can create tasks.";
        }

        if (!formData.taskName) newErrors.taskName = "Task name is required";
        if (!formData.description) newErrors.description = "Task Description is required";
        if (!formData.assignBy) newErrors.assignBy = "Assigned by is required";
        if (!formData.assignTo) newErrors.assignTo = "Assigned to is required";
        if (!formData.priority) newErrors.priority = "Priority is required";
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (formData.startDate && formData.endDate && end <= start) {
            newErrors.endDate = "End date must be greater than start date.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateTaskSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setAlert({ message: "Please correct the form errors.", severity: "error" });
            return;
        }

        const submitData = {
            ...formData,
            isCompleted: undefined,
            isVerified: undefined,
        };

        try {
            const response = await axios.post(
                "http://localhost:4000/api/tasks/createtask",
                submitData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Task created successfully:", response.data);
            setAlert({ message: "Task created successfully!", severity: "success" });

            setTimeout(() => {
                setAlert({ message: "", severity: "" });
                navigate("/tasks/dashboard");
            }, 1500);
        } catch (error) {
            if (error.response?.status === 401) {
                console.error("Unauthorized! Token expired or invalid.");
                localStorage.removeItem("token");
                setAlert({ message: "Session expired. Please log in again.", severity: "error" });
                setTimeout(() => navigate("/login"), 1500);
            } else {
                const errorMessage =
                    error.response?.data?.message || "An error occurred while creating the task.";
                setAlert({ message: errorMessage, severity: "error" });
            }
        }
    };

    return (
        <div className="create-task-container">
            <header className="create-task-header">
                <h2>Create New Task</h2>
            </header>

            {alert.message && (
                <Stack sx={{ width: "100%", mb: 2 }}>
                    <Alert severity={alert.severity} sx={{fontWeight:"bold"}} onClose={() => setAlert({ message: "", severity: "" })}>
                        {alert.message}
                    </Alert>
                </Stack>
            )}

            <form className="create-task-form" onSubmit={handleCreateTaskSubmit}>
                {errors.permission && <span className="error-text">{errors.permission}</span>}

                <label>Task Name</label>
                <input
                    type="text"
                    name="taskName"
                    value={formData.taskName}
                    onChange={handleFormChange}
                    className={errors.taskName ? "error-input" : ""}
                />
                {errors.taskName && <span className="error-text">{errors.taskName}</span>}

                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={errors.description ? "error-input" : ""}
                ></textarea>
                {errors.description && <span className="error-text">{errors.description}</span>}

                <label>Assign By</label>
                <select
                    name="assignBy"
                    value={formData.assignBy}
                    onChange={handleFormChange}
                    className={errors.assignBy ? "error-input" : ""}
                >
                    <option value="">Select Admin/Manager</option>
                    {assignByUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                            {`${user.username} (${user.role})`}
                        </option>
                    ))}
                </select>
                {errors.assignBy && <span className="error-text">{errors.assignBy}</span>}

                <label>Assign To</label>
                <select
                    name="assignTo"
                    value={formData.assignTo}
                    onChange={handleFormChange}
                    className={errors.assignTo ? "error-input" : ""}
                >
                    <option value="">Select Employee/Guest</option>
                    {assignToUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                            {`${user.username} (${user.role})`}
                        </option>
                    ))}
                </select>
                {errors.assignTo && <span className="error-text">{errors.assignTo}</span>}

                <label>Priority</label>
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className={errors.priority ? "error-input" : ""}
                >
                    <option value="">Select Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="critical">Critical</option>
                </select>
                {errors.priority && <span className="error-text">{errors.priority}</span>}

                <label>Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className={errors.startDate ? "error-input" : ""}
                />
                {errors.startDate && <span className="error-text">{errors.startDate}</span>}

                <label>End Date</label>
                <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    className={errors.endDate ? "error-input" : ""}
                />
                {errors.endDate && <span className="error-text">{errors.endDate}</span>}

                <button type="submit">Create Task</button>
            </form>
        </div>
    );
}

export default CreateTask;