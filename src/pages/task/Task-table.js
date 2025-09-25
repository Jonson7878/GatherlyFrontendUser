import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../config';
import { jwtDecode } from 'jwt-decode';
import { Alert, Stack, Button, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deepPurple } from '@mui/material/colors';

const TaskTable = () => {
    const [tasks, setTasks] = useState([]);
    const [status, setStatus] = useState('');
    const [latest, setLatest] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState(''); // eslint-disable-next-line
    const [companyId, setCompanyId] = useState('');
    const [alert, setAlert] = useState({ message: '', severity: '' });
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setAlert({ message: 'You are not authorized. Please log in.', severity: 'warning' });
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            const decodedToken = jwtDecode(token);
            const role = decodedToken.role || decodedToken.user?.role || '';
            const uid = decodedToken.id || decodedToken.userId || decodedToken.user?._id || '';
            const cid = decodedToken.companyId || decodedToken.user?.companyId || '';

            setUserRole(role);
            setUserId(uid);
            setCompanyId(cid);

            const queryParams = new URLSearchParams();
            if (status) queryParams.append('status', status);
            if (latest) queryParams.append('latest', latest);
            if (startDate) queryParams.append('startDate', startDate);
            if (cid) queryParams.append('companyId', cid);

            const response = await axios.get(`${API_BASE}/api/tasks/?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTasks(response.data.tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setAlert({ message: error.response?.data?.message || 'Error fetching tasks', severity: 'error' });
            setTimeout(() => navigate('/login'),1500)
        }
    };

    const handleEdit = (taskId) => {
        navigate(`/update-task/${taskId}`);
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/api/tasks/deletetask/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAlert({ message: 'Task deleted successfully!', severity: 'success' });
            fetchTasks();
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        } catch (error) {
            console.error('Error deleting task:', error);
            setAlert({ message: error.response?.data?.message || 'Error deleting task', severity: 'error' });
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        }
    };

    const handleCompletedChange = async (taskId, isCompleted) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE}/api/tasks/completetask/${taskId}`,
                { isCompleted },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlert({ message: 'Task completion status updated!', severity: 'success' });
            fetchTasks();
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        } catch (error) {
            console.error('Error updating task completion:', error);
            setAlert({ message: error.response?.data?.message || 'Error updating task completion', severity: 'error' });
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        }
    };

    const handleVerify = async (taskId, isVerified) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_BASE}/api/tasks/verifytask/${taskId}`,
                isVerified ? { isVerified } : { isVerified, isCompleted: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlert({ message: 'Task verification status updated!', severity: 'success' });
            fetchTasks();
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        } catch (error) {
            console.error('Error verifying task:', error);
            setAlert({ message: error.response?.data?.message || 'Error verifying task', severity: 'error' });
            setTimeout(() => setAlert({ message: '', severity: '' }), 1500);
        }
    };

    useEffect(() => {
        fetchTasks(); // eslint-disable-next-line
    }, [status, latest, startDate]);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Typography variant="h4" sx={{ m: 0, mb: 5, color: '#5e35b1', fontWeight: 'bold', textAlign: 'left' }}>Task Management</Typography>

            {alert.message && (
                <Stack sx={{ width: '100%', mb: 2 }}>
                    <Alert severity={alert.severity} onClose={() => setAlert({ message: '', severity: '' })}>
                        {alert.message}
                    </Alert>
                </Stack>
            )}

            <fieldset style={{ padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                <legend><strong>Filter Tasks</strong></legend>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/create-task')}
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
                            Add Task
                        </Button>
                    )}

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <label>
                            <strong>Status:</strong>{' '}
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </label>

                        <label>
                            <strong>Start Date:</strong>{' '}
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={latest}
                                onChange={() => setLatest((prev) => !prev)}
                            />{' '}
                            <strong>Latest 24 Hours</strong>
                        </label>
                    </div>
                </div>
            </fieldset>

            {tasks.length > 0 ? (
                <table
                    border="1"
                    cellPadding="8"
                    cellSpacing="0"
                    style={{ width: '100%', borderCollapse: 'collapse'}}
                >
                    <thead style={{ color: 'black' }}>
                        <tr>
                            <th>Task Name</th>
                            <th>Description</th>
                            <th>Assigned By</th>
                            <th>Assigned To</th>
                            <th>Is Completed</th>
                            <th>Is Verified</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => {
                            const canEdit =
                                userRole === 'admin' ||
                                userRole === 'manager' ||
                                task.assignTo?.userId === userId ||
                                task.assignTo?._id === userId;

                            const canDelete = userRole === 'admin' || userRole === 'manager';

                            return (
                                <tr key={task._id}>
                                    <td>{task.taskName}</td>
                                    <td>{task.description}</td>
                                    <td>{task.assignBy?.username || 'N/A'}</td>
                                    <td>{task.assignTo?.username || 'N/A'}</td>
                                    <td>
                                        {task.isCompleted ? (
                                            'Completed'
                                        ) : userRole === 'employee' || userRole === 'guest' ? (
                                            <input
                                                type="checkbox"
                                                checked={task.isCompleted}
                                                onChange={(e) => handleCompletedChange(task._id, e.target.checked)}
                                            />
                                        ) : (
                                            'Pending'
                                        )}
                                    </td>
                                    <td>
                                        {userRole === 'admin' ? (
                                            <input
                                                type="checkbox"
                                                checked={task.isVerified}
                                                onChange={(e) => handleVerify(task._id, e.target.checked)}
                                            />
                                        ) : task.isVerified ? (
                                            'Verified'
                                        ) : (
                                            'Pending'
                                        )}
                                    </td>
                                    <td>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                        {canEdit && (
                                            // <FaEdit
                                            //     onClick={() => handleEdit(task._id)}
                                            //     style={{ cursor: 'pointer', marginRight: '10px', color: 'blue' }}
                                            // />
                                            <EditIcon
                                            onClick={() => handleEdit(task._id)}
                                            color="primary"
                                            sx={{ cursor: 'pointer' }}
                                          />
                                        )}
                                        {canDelete && (
                                            // <FaTrash
                                            //     onClick={() => handleDelete(task._id)}
                                            //     style={{ cursor: 'pointer', color: 'red' }}
                                            // />
                                            <DeleteIcon
                                                onClick={() => handleDelete(task._id)}
                                                color="error"
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        )}
                                        </Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>No tasks found</p>
            )}
        </div>
    );
};

export default TaskTable;