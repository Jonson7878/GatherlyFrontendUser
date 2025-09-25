import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { deepPurple } from '@mui/material/colors';
import { jwtDecode } from 'jwt-decode';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import API_BASE from '../../config.js';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAlert({message:'You are not authorized. Please log in.', severity:'warning'})
          setTimeout(() => navigate('/login'),1500);
          return;
        }

        const decoded = jwtDecode(token);
        setUserRole(decoded.role || '');

        if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setAlert({ message: 'Session expired. Please log in again.', severity: 'warning' });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        const response = await axios.get(`${API_BASE}/api/managed-users/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { status, allUsers } = response.data;
        if (status && Array.isArray(allUsers)) {
          const filteredUsers = allUsers.filter(user => user.companyId === decoded.companyId);
          setUsers(filteredUsers);
        } else {
          setAlert({ message: 'Failed to load users', severity: 'error' });
        }
        // axios throws on 401; catch block will handle it
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          setAlert({ message: 'Session expired. Please log in again.', severity: 'warning' });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
        setAlert({
          message: error.response?.data?.message || 'Error fetching users',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: '', severity: '' });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleAddUser = () => {
    navigate('/add-user');
  };

  const handleEdit = (userId) => {
    if (userRole === 'admin') {
      navigate(`/update-user/${userId}`);
    } else {
      setAlert({ message: 'Access Denied: Only admins can edit users.', severity: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (userRole !== 'admin') {
      setAlert({ message: 'Access Denied: Only admins can delete users.', severity: 'error' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/managed-users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter(user => user._id !== userId));
      setAlert({ message: 'User deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlert({
        message: error.response?.data?.message || 'Error deleting user',
        severity: 'error',
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ m: 0, mb: 5, color: '#5e35b1', fontWeight: 'bold' }}>User Management</Typography>
        {userRole === 'admin' && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{
              textTransform: 'none',
              borderRadius: '50px',
              padding: '6px 18px',
              fontWeight: 600,
              fontSize: '0.85rem',
              minWidth: '110px',
              whiteSpace: 'nowrap',
              boxShadow: 'none',
              borderColor: deepPurple[600],
              color: deepPurple[600],
              '&:hover': {
                backgroundColor: deepPurple[600],
                color: '#fff',
                borderColor: deepPurple[600],
                boxShadow: '0px 4px 10px rgba(0,0,0,0.2)'
              }
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      {alert.message && (
        <Stack sx={{ width: '100%', mb: 2 }}>
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

      

      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead style={{ color: 'black' }}>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              {userRole === 'admin' && <th style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                {userRole === 'admin' && (
                  <td style={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                      <EditIcon
                        onClick={() => handleEdit(user._id)}
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                      />
                      <DeleteIcon
                        onClick={() => handleDelete(user._id)}
                        color="error"
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users available.</p>
      )}
    </div>
  );
};

export default UserTable;
