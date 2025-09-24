import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAlert({
          message: "You are not authorized. Please Log in",
          severity: "warning",
        });
        setLoading(false);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/order/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = response?.data?.data || [];

        if (ordersData.length === 0) {
          setAlert({ message: "No Pending Orders found.", severity: "info" });
        }

        setOrders(ordersData);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setAlert({ message: "Session expired. Please log in again.", severity: "warning" });
            localStorage.removeItem("token");
            setTimeout(() => navigate("/login"), 1500);
          } else {
            const serverMessage = err.response?.data?.message || "Error fetching orders.";
            setAlert({ message: serverMessage, severity: "error" });
          }
        } else {
          setAlert({ message: "Network error fetching orders.", severity: "error" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:4000/api/order/delete/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({ message: "Order deleted successfully.", severity: "success" });

      // Remove deleted order from list
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setAlert({ message: "Session expired. Please log in again.", severity: "warning" });
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 1500);
        } else if (err.response?.status === 403) {
          const serverMessage = err.response?.data?.message || "You do not have permission to delete this order.";
          setAlert({ message: serverMessage, severity: "error" });
        } else {
          const serverMessage = err.response?.data?.message || "Failed to delete order.";
          setAlert({ message: serverMessage, severity: "error" });
        }
      } else {
        setAlert({ message: "Network error deleting order.", severity: "error" });
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, minHeight: "100vh" }}>
        <Typography
          variant="h4"
          sx={{ mb: 5, fontWeight: "bold", color: "#5e35b1" }}
        >
          Pending Orders
        </Typography>
        {alert.message && (
          <Stack sx={{ width: "100%", mb: 2 }}>
            <Alert severity={alert.severity} onClose={() => setAlert({ message: "", severity: "" })}>
              {alert.message}
            </Alert>
          </Stack>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
          <CircularProgress size={80} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 5,
          fontWeight: "bold",
          color: "#5e35b1",
        }}
      >
        Pending Orders
      </Typography>

      {alert.message && (
        <Stack sx={{ width: "100%", mb: 2 }}>
          <Alert severity={alert.severity} onClose={() => setAlert({ message: "", severity: "" })}>
            {alert.message}
          </Alert>
        </Stack>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: "16px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(224, 224, 224, 1)" }}>
        <Table
          sx={{
            minWidth: 750,
            borderCollapse: "separate",
            borderSpacing: 0,
            "& .MuiTableCell-root": {
              borderRight: "1px solid rgba(224, 224, 224, 1)",
            },
            "& .MuiTableCell-root:last-of-type": {
              borderRight: "none",
            },
            "& .MuiTableRow-root > .MuiTableCell-root:first-of-type": {
              borderLeft: "1px solid rgba(224, 224, 224, 1)",
            },
          }}
          aria-label="order table"
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Order ID</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Event Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Order Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>User Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Company Name</TableCell>
              <TableCell align="center"  sx={{ fontWeight: "bold", color: "white" }}>Payment Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Total Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>Actions</TableCell>            
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
              <TableRow key={order._id} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.eventId?.eventName || "N/A"}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.userId?.username || "N/A"}</TableCell>
                <TableCell>{order.companyId?.name || "N/A"}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{order.totalAmount || 0}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="view order"
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="secondary"
                        aria-label="edit order"
                        onClick={() => navigate(`/update-order/${order._id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete order"
                        onClick={() => handleDelete(order._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          marginTop: "20px",
          "& .MuiTablePagination-select": {
            color: "#263238",
          },
          "& .MuiTablePagination-actions": {
            color: "#1976d2",
          },
        }}
      />
    </Container>
  );
};

export default OrdersList;
