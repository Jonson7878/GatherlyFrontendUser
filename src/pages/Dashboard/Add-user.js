import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

function AddUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    companyName: "",
  });

  const [companyId, setCompanyId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", severity: "" }); //Alert state
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setCompanyId(decodedToken.companyId);
      setUserRole(decodedToken.role);

      axios
        .get(`http://localhost:4000/api/company/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setFormData((prevState) => ({
            ...prevState,
            companyName: response.data.company.name,
          }));
        })
        .catch((error) => {
          console.error("Error fetching company data:", error);
        });
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/login");
    }
  }, [navigate, token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setAlert({ message: "", severity: "" }); //Alert on input
  };

  const validateForm = () => {
    const newErrors = {};

    if (userRole !== "admin" && userRole !== "manager") {
      newErrors.permission = "Only admins and managers can create users.";
    }

    if (formData.role === "admin" && userRole !== "admin") {
      newErrors.rolePermission = "Only admins can create another admin.";
    }

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { companyName, ...requestData } = {
      ...formData,
      companyId,
    };

    try {  // eslint-disable-next-line
      const response = await axios.post(
        "http://localhost:4000/api/user/register",
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlert({ message: "User created successfully!", severity: "success" });

      setTimeout(() => {
        navigate("/users/dashboard");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred while creating the user.";
      setAlert({ message: errorMessage, severity: "error" });
    }
  };

  return (
    <div className="add-user-container">
      <header className="add-user-header">
        <h2>Add New User</h2>
      </header>

      {/* Alert Component */}
      {alert.message && (
        <Stack sx={{ width: "100%", mb: 2 }}>
          <Alert
            severity={alert.severity}
            sx={{
              fontWeight: "bold",
              color: (theme) => {
                switch (alert.severity) {
                  case "error":
                    return theme.palette.error.main;
                  case "success":
                    return theme.palette.success.main;
                  default:
                    return theme.palette.text.primary;
                }
              },
            }}
          >
            {alert.message}
          </Alert>
        </Stack>
      )}

      <form className="add-user-form" onSubmit={handleAddUserSubmit}>
        {errors.permission && <span className="error-text">{errors.permission}</span>}
        {errors.rolePermission && <span className="error-text">{errors.rolePermission}</span>}

        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleFormChange}
          className={errors.username ? "error-input" : ""}
        />
        {errors.username && <span className="error-text">{errors.username}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleFormChange}
          className={errors.email ? "error-input" : ""}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleFormChange}
          className={errors.password ? "error-input" : ""}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleFormChange}
          className={errors.confirmPassword ? "error-input" : ""}
        />
        {errors.confirmPassword && (
          <span className="error-text">{errors.confirmPassword}</span>
        )}

        <label>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleFormChange}
          className={errors.role ? "error-input" : ""}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="guest">Guest</option>
        </select>
        {errors.role && <span className="error-text">{errors.role}</span>}

        <label>Company</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          readOnly
          className="read-only"
        />

        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default AddUser;
