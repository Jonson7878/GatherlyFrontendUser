import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Divider,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import API_BASE from '../../config';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", severity: "" });

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      try {
  const res = await fetch(`${API_BASE}/api/order/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401 || res.status === 403) {
          setAlert({ message: "Session expired. Please log in again.", severity: "warning" });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setOrder(data.data);
      } catch (err) {
        setAlert({ message: err.message || "Something went wrong", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box mt={10} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (alert.message) {
    return (
      <Box mt={10} textAlign="center">
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" mt={5} px={2}>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Event Details
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          <Typography>
            <strong>Event:</strong> {order.eventId?.eventName}
          </Typography>
          <Typography>
            <EventIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            <strong>Date:</strong>{" "}
            {new Date(order.eventId?.dateTime).toLocaleString("en-IN", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </Typography>
          <Typography>
            <LocationOnIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            <strong>Location:</strong> {order.eventId?.location}
          </Typography>
        </Stack>
      </Card>
      
      <Card elevation={4} sx={{borderRadius:3, p:3, mb: 4}}>
        <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
          Order Summary
        </Typography>
        <Divider sx={{my: 2}} />

        <Typography variant="body1" mb={1}>
          <strong>Order ID:</strong> {order._id}
        </Typography>

        <Typography variant="h6" fontWeight={600} mt={2} gutterBottom>
          Tickets Purchased
        </Typography>

        {order.tickets.map((ticket,index) => (
          <Card
              key={index}
              variant="outlined"
              sx={{my:2, p:2, borderRadius:2, bgcolor:"#f5f5f5"}}
          >
          <Stack spacing={1}>
            <Typography fontWeight={600}>{ticket.ticketName}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip icon={<ConfirmationNumberIcon />} label={`Qty: ${ticket.quantity}`} />
              <Chip label={`Price: ₹${ticket.amount}`} color="success" />
            </Stack>
          </Stack>
          </Card>
        ))}
        <Divider sx={{my: 3}} />
        <Typography variant="h6" fontWeight={700} color="green">
          Total Amount: ₹{order.totalAmount}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={()=> navigate('/orders/dashboard')}
            sx={{
              mt: 8,
              px: 4,
              py: 1,
              fontWeight:600,
              color: "primary.main",
              borderColor:"primary.main",
              fontSize:"1rem",
              borderRadius:20,
              textTransform: "none",
              "&:hover" :{
                bgcolor: "primary.light",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            ← Back
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={()=> navigate(`/checkout/${order._id}`)}
            sx={{
              mt: 8,
              px: 4,
              py: 1,
              fontWeight:600,
              color: "#263238",
              borderColor:"#263238",
              fontSize:"1rem",
              borderRadius:20,
              textTransform: "none",
              "&:hover" :{
                bgcolor: "#37474f",
                color: "white",
                borderColor: "#263238",
              },
            }}
          >
            Checkout
          </Button>
        </Box>
      </Card>
  </Box>
)
}