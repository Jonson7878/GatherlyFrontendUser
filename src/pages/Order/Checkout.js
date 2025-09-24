import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PromoCodeField from "./PromoCodeField";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:4000/api/order/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401 || res.status === 403) {
          setAlert({ message: "Session expired. Please log in again.", severity: "warning" });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }
        // const data = await res.json();
        setOrder(data.data);
      } catch (err) {
        setAlert({ message: err.message || "Something went wrong", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id,navigate]);

  const companyId = useMemo(() => {
    return order?.companyId?._id || order?.companyId || order?.eventId?.createdBy?.companyId?._id || "";
  }, [order]);

  const originalAmount = useMemo(() => {
    return order?.totalAmount || 0;
  }, [order]);

  const finalAmount = useMemo(() => {
    return appliedPromo?.finalAmount ?? originalAmount;
  }, [appliedPromo, originalAmount]);

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
    <Box maxWidth="900px" mx="auto" mt={5} px={2}>
      
      <Card elevation={4} sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Checkout
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Typography>
            <strong>Order ID:</strong> {order._id}
          </Typography>
          <Typography>
            <strong>Event:</strong> {order.eventId?.eventName}
          </Typography>
          <Typography>
            <strong>Date:</strong>{" "}
            {new Date(order.eventId?.dateTime).toLocaleString("en-IN", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </Typography>
          <Typography>
            <strong>Location:</strong> {order.eventId?.location}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Tickets
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            bgcolor: "#f0f0f0",
            p: 1.5,
            borderRadius: 1,
            fontWeight: "bold",
            border: "1px solid #ddd",
            mb: 1,
          }}
        >
          <Typography sx={{ flex: 1 }}>Ticket</Typography>
          <Typography sx={{ width: 80, textAlign: "center" }}>Qty</Typography>
          <Typography sx={{ width: 100, textAlign: "center" }}>Price</Typography>
          <Typography sx={{ width: 120, textAlign: "right" }}>Total</Typography>
        </Box>
        <Stack spacing={1}>
          {order.tickets?.map((ticket, index) => {
            const quantity = Number(ticket.quantity || 0);
            const price = Number(ticket.amount || 0);
            const lineTotal = quantity * price;
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  border: "1px solid #eee",
                  borderRadius: 1,
                  bgcolor: "#fff",
                }}
              >
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <ConfirmationNumberIcon color="action" />
                  <Typography fontWeight={600}>{ticket.ticketName}</Typography>
                </Box>
                <Typography sx={{ width: 80, textAlign: "center", fontWeight: 600 }}>{quantity}</Typography>
                <Typography sx={{ width: 100, textAlign: "center", fontWeight: 600 }}>₹{price}</Typography>
                <Typography sx={{ width: 120, textAlign: "right", fontWeight: 700,color: "green" }}>₹{lineTotal}</Typography>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" ,color: "green"}}>
          <Typography variant="h6" fontWeight={700}>
            Total Amount: ₹{originalAmount}
          </Typography>
        </Box>

        <PromoCodeField
          companyId={companyId}
          originalAmount={originalAmount}
          orderId={order?._id}
          onApply={(info) => setAppliedPromo(info)}
        />

        {/* {appliedPromo && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#eef7ee", mt: 1 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
              <Chip label={`Code: ${appliedPromo.code}`} />
              <Typography>
                <strong>Discount:</strong> {appliedPromo.discountType === "percent" ? `${appliedPromo.discountAmount}%` : `₹${appliedPromo.discountAmount}`}
              </Typography>
              <Typography>
                <strong>Amount after discount:</strong> ₹{appliedPromo.finalAmount}
              </Typography>
            </Stack>
          </Box>
        )} */}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Typography variant="h6" fontWeight={700} color="green">
            Final Amount: ₹{finalAmount}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mt: 3, textTransform: "none", borderRadius: 20 }}
          >
            ← Back
          </Button> */}
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              mt: 5,
              fontWeight: 600,
              color: "primary.main",
              borderColor: "primary.main",
              borderRadius: 20,
              textTransform: "none",
              "&:hover": {
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
            onClick={() => navigate(`/payment/${order?._id}`)}
            sx={{
              mt: 5,
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
            Pay Now
          </Button>
        </Box>
      </Card>
    </Box>
  );
}


