import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function UpdateOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState({ message: "", severity: "" });

  const [selectedTickets, setSelectedTickets] = useState({}); // eslint-disable-next-line
  const [processingTickets, setProcessingTickets] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
      const token = localStorage.getItem("token");
      if (!token){
        setAlertState({message:'You are not authorized. Please log in.', severity:"error"})
        setTimeout(() => navigate('/login'),1500);
        return;
      }
        const res = await fetch(`http://localhost:4000/api/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          setAlertState({
            message: "Session expired. Please log in again",
            severity:"warning",
          })
          setTimeout(() => navigate("/login"),1500)
          return;
        }
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }

        const data = await res.json();
        setOrder(data.data);

        const initialSelected = {};
        data.data.eventId.tickets.forEach((ticket, idx) => {
          const matched = data.data.tickets.find((t) => t.ticketId === ticket._id);
          initialSelected[idx] = matched ? matched.quantity : 0;
        });

        setSelectedTickets(initialSelected);
      } catch (err) {
        setAlertState({ message: err.message || "Something went wrong", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();  // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return (
      <Box mt={10} textAlign="center">
        {/* <Alert severity={alert.severity}>{alert.message}</Alert> */}
        <CircularProgress />
      </Box>
    )
  }

  if (alertState.message) {
    return(
      <Box mt={10} textAlign="center">
        <Alert severity={alertState.severity}>{alertState.message}</Alert>
      </Box>
    )
  }

  const handleIncrease = (index) => {
    setSelectedTickets((prev) =>{
      const currentQty = prev[index] || 0;
      const maxQty = order.eventId.tickets[index].quantity;
      if (currentQty < maxQty){
        return { ...prev, [index]: currentQty + 1}
      }
      return prev
    })
  }
  const handleDecrease = (index) => {
    setSelectedTickets((prev) =>{
      const currentQty = prev[index] || 0;
      if (currentQty > 0){
        return { ...prev, [index]: currentQty - 1 };
      }
      return prev
    })
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try{
      const updatedTickets = order.eventId.tickets.map((ticket, idx) => ({
        ticketId: ticket._id,
        ticketName: ticket.ticketName,
        price: ticket.price,
        quantity: selectedTickets[idx] || 0,
      }));
      const totalAmount = updatedTickets.reduce(
        (sum,t) => sum + t.price * (t.quantity || 0),0
      )

      const res = await fetch(`http://localhost:4000/api/order/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tickets: updatedTickets, totalAmount }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setAlertState({message:"Order updated successfully!", severity: "success"});
      navigate('/orders/dashboard');
    } catch (err) {
      setAlertState({ message: err.message || "Update failed", severity: "error" });
    }
  };
  
  return (
    <Box maxWidth="900px" mx="auto" mt={5} px={2}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h5" fontWeight={800}>
            Update Order #{order._id}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Make changes to your ticket selections below
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="h5" fontWeight="bold" mb={1}>
            {order.eventId.eventName}
          </Typography>

          {order.eventId.dateTime && (
            <Typography color="text.secondary" gutterBottom>
              {new Date(order.eventId.dateTime).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </Typography>
          )}
          <Typography mb={1}>
            <strong>Location:</strong> {order.eventId.location}
          </Typography>
          <Typography mb={2}>
            <strong>Description:</strong> {order.eventId.description}
          </Typography>

          <Box mt={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <ConfirmationNumberIcon sx={{ color: "#862d86" }} />
              Available Tickets
            </Typography>

            {order.eventId.tickets.map((ticket, index) => {
              const selectedQty = selectedTickets[index] || 0;
              const isMaxReached = selectedQty >= ticket.quantity;
              const isProcessing = processingTickets[index] || false;
              const totalPriceForTicket = selectedQty * ticket.price;

              return (
                <Box
                  key={index}
                  sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "box-shadow 0.2s ease, transform 0.1s ease",
                    "&:hover": {
                      boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box sx={{ flex: "1 1 auto" }}>
                    <Typography fontWeight={700} fontSize="1.1rem" mb={0.5}>
                      {ticket.ticketName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      {ticket.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                      <Chip label={`₹${ticket.price}`} color="success" />
                      <Chip label={`Available: ${ticket.quantity}`} color="default" />
                    </Stack>
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "#e8f5e9",
                        display: "inline-block",
                        fontWeight: 600,
                        color: "#2e7d32",
                        minWidth: "170px",
                        textAlign: "center",
                      }}
                    >
                      Selected: {selectedQty} | Total: ₹{totalPriceForTicket}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDecrease(index)}
                      disabled={selectedQty === 0 || isProcessing}
                      sx={{
                        borderColor: "#ef5350",
                        color: "#c62828",
                        mr: 1,
                        "&:hover": {
                          bgcolor: "#b71c1c",
                          color: "white",
                        },
                      }}
                    >
                      <RemoveIcon />
                    </Button>
                    <Typography fontWeight={700} sx={{ width: 24, textAlign: "center" }}>
                      {selectedQty}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleIncrease(index)}
                      disabled={isMaxReached || isProcessing}
                      sx={{
                        borderColor: "#81c784",
                        color: "#2e7d32",
                        ml: 1,
                        "&:hover": {
                          bgcolor: "#1b5e20",
                          color: "white",
                        },
                      }}
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Box>
              );
            })}

            <Divider sx={{ mt: 3, mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="primary"
                disabled={Object.values(selectedTickets).every((qty) => qty === 0)}
                onClick={handleSubmit}
                sx={{
                  minWidth: 140,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "primary.main",
                  borderRadius: 20,
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "white",
                    backgroundColor: "primary.main",
                  },
                }}
              >
                Update Order
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/orders/dashboard')}
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  color: "#263238",
                  borderColor: "#263238",
                  borderRadius: 20,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#37474f",
                    color: "white",
                    borderColor: "#263238",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}