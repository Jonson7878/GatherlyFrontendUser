import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, Typography, Divider, Stack, Button, Alert, CircularProgress } from "@mui/material";
import { createPaymentOrder, verifyPayment } from "../../api/paymentApi";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", severity: "info" });
  const [order, setOrder] = useState(null);  // eslint-disable-next-line
  const [method, setMethod] = useState("card");

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:4000/api/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load order");
        setOrder(data.data);
      } catch (e) {
        setAlert({ message: e.message, severity: "error" });
      }
    };
    fetchOrder();
  }, [id]);

  const amount = useMemo(() => Number(order?.totalAmount || 0), [order]);

  const startPayment = useCallback(async () => {
    if (!order) return;
    setLoading(true);
    setAlert({ message: "", severity: "info" });
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load.");

      const prefill = {
        name: order?.user?.name || "",
        email: order?.user?.email || "",
        contact: order?.user?.phone || "",
      };

      const createRes = await createPaymentOrder({
        orderId: order._id,
        amount,
        currency: "INR",
        paymentMethod: method,
        prefill,
      });

      if (!createRes?.success) throw new Error(createRes?.message || "Create order failed");
      const { order: rzpOrder } = createRes;

      const options = {
        key: 'rzp_test_RIC27JIHD8DYNj' || "",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Payment",
        description: `Order #${order._id}`,
        order_id: rzpOrder.id,
        prefill,
        theme: { color: "#1976d2" },
        method: { [method]: true },
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes?.success) {
              setAlert({ message: "Payment Successful", severity: "success" });
              setTimeout(() => navigate('/dashboard'), 1200);
            } else {
              setAlert({ message: verifyRes?.message || "Verification failed", severity: "error" });
            }
          } catch (err) {
            setAlert({ message: err.message || "Verification error", severity: "error" });
          }
        },
        modal: {
          ondismiss: function () {
            setAlert({ message: "Payment cancelled", severity: "warning" });
          },
        },
      };

      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setAlert({ message: e.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [order, amount, method, navigate]);

  return (
    <Box maxWidth="800px" mx="auto" mt={5} px={2}>
      <Card elevation={5} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Complete Your Payment
        </Typography>
        <Divider sx={{ my: 2 }} />

        {alert.message ? (
          <Box mb={2}><Alert severity={alert.severity}>{alert.message}</Alert></Box>
        ) : null}

        {!order ? (
          <Box textAlign="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            <Stack spacing={1} mb={2}>
              <Typography><strong>Order ID:</strong> {order._id}</Typography>
              <Typography><strong>Event:</strong> {order.eventId?.eventName}</Typography>
              <Typography variant="h6" fontWeight={700} color="green"><strong>Total Payable:</strong> ₹{amount}</Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box mt={4} display="flex" justifyContent="space-between">
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
                onClick={startPayment}
                disabled={loading}
                sx={{
                  mt: 5,
                  fontWeight: 600,
                  color: "#004d40",
                  borderColor: "#004d40",
                  borderRadius: 20,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#00695c",
                    color: "white",
                    borderColor: "#004d40",
                  },
                }}
              >
                {loading ? "Processing..." : `Pay ₹${amount}`}
              </Button>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}


