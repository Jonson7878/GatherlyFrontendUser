import React, { useEffect, useMemo, useState, } from "react";
import {useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import API_BASE from '../../config';

export default function PromoCodeField({ companyId, originalAmount = 0, orderId, onApply, disabled }) {  // eslint-disable-next-line 
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState(null); 
  const [alert, setAlert] = useState({ message: "", severity: "" });

  const selectedPromo = useMemo(
    () => promoCodes.find((p) => p._id === selectedId) || null,
    [selectedId, promoCodes]
  );

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
  fetch(`${API_BASE}/api/offer/company`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setPromoCodes(Array.isArray(data?.promoCodes) ? data.promoCodes : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load promo codes");
        setPromoCodes([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    setSelectedId("");
    setAppliedInfo(null);
  }, [companyId]);

  const handleApply = async () => {
    if (!selectedPromo) return;
    try {
      setApplyLoading(true);
      setError("");
      const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/offer/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: selectedPromo.code, originalAmount, orderId }),
      });
      let data;
      try {
        data = await res.json();
      } catch (_) {
        data = {};
      }
      if (res.status === 401) {
        const message = data?.message || "Unauthorized";
        // Do not auto-redirect. Surface the message so the user can retry or log in manually.
        setAlert({ message, severity: "warning" });
        return;
      }
      if (res.status === 403) {
        setError(data?.message || "Forbidden");
        return;
      }
      if (!res.ok || data.status === false) {
        throw new Error(data?.message || "Failed to apply promo code");
      }
      setAppliedInfo({
        code: selectedPromo.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        finalAmount: data.finalAmount,
        description: data.description,
      });
      if (onApply) onApply({
        _id: selectedPromo._id,
        code: selectedPromo.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        finalAmount: data.finalAmount,
        description: data.description,
      });
    } catch (err) {
      setAppliedInfo(null);
      setError(err.message || "Error applying promo code");
    } finally {
      setApplyLoading(false);
    }
  };
  
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
    <Box my={3}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Promo Code
      </Typography>

      {error && (
        <Stack sx={{ mb: 1 }}>
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        </Stack>
      )}

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <FormControl sx={{ minWidth: 280 }} size="small" disabled={disabled || loading || !!appliedInfo}>
          <Select
            id="promo-select"
            value={selectedId}
            displayEmpty
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1b5e20' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1b5e20' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1b5e20' },
              '& .MuiSelect-select': { color: '#1b5e20' },
              '&.Mui-disabled .MuiSelect-select': { color: '#4caf50 !important', WebkitTextFillColor: '#4caf50' },
            }}
            renderValue={(value) => {
              if (!value) return (
                <Typography sx={{ color: '#1b5e20' }}>Select a promo code</Typography>
              );
              const selected = promoCodes.find((p) => p._id === value);
              return selected ? selected.code : "Select a promo code";
            }}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {promoCodes.map((promo,index) => (
              <MenuItem
                key={promo._id}
                value={promo._id}
                sx={{
                  borderBottom: index < promoCodes.length - 1 ? '1px solid #e0e0e0' : 'none',
                  py: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
                    border: '1px dashed #a5d6a7',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                    '&:hover': {
                      transform: 'scale(1.01)',
                      boxShadow: '0 4px 14px rgba(27,94,32,0.15)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)', }}>
                    <LocalOfferRoundedIcon sx={{ color: '#1b5e20' }} fontSize="small" />
                    <Typography sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#1b5e20' }}>
                      {promo.code}
                    </Typography>
                  </Box>
                  {promo.description && (
                    <Typography
                      variant="caption"
                      sx={{ gridColumn: '1 / -1', color: '#2e7d32' }}
                    >
                      {promo.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          // color="primary"
          disabled={disabled || !selectedId || !!appliedInfo || applyLoading}
          onClick={handleApply}
          sx={{ 
            textTransform: "none", 
            fontWeight: 700,
            lineHeight: 1.90,
            color: "#1b5e20",
            borderColor: "#1b5e20",
            "&:hover": {
            bgcolor: "#1b5e20",
            color: "white",
            borderColor: "#1b5e20",
          },
          }}
        >
          {applyLoading ? "Applying..." : "Apply"}
        </Button>
      </Box>

      {/* {selectedPromo && !disabled && !appliedInfo && (
        <Box mt={2} sx={{ p: 2, borderRadius: 2, bgcolor: "#f9f9fb" }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Code: ${selectedPromo.code}`} color="info" />
            {selectedPromo.discountType === "percent" && selectedPromo.discountAmount != null && (
              <Chip label={`Discount: ${selectedPromo.discountAmount}%`} color="success" />
            )}
            {selectedPromo.discountType === "flat" && selectedPromo.discountAmount != null && (
              <Chip label={`Discount: ₹${selectedPromo.discountAmount}`} color="success" />
            )}
            {(selectedPromo.expiresAt || selectedPromo.expiryDate) && (
              <Chip
                label={`Expires: ${new Date(selectedPromo.expiresAt || selectedPromo.expiryDate).toLocaleDateString()}`}
                color="warning"
              />
            )}
          </Stack>
          {selectedPromo.description && (
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {selectedPromo.description}
            </Typography>
          )}
        </Box>
      )} */}

      {(disabled || !!appliedInfo) && (
        <Box mt={2} sx={{ p: 2, borderRadius: 2, bgcolor: "#eef7ee" }}>
          {appliedInfo && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 0.5, columnGap: 2 }}>
              <Typography variant="body2">Total Amount:</Typography>
              <Typography variant="body2" sx={{ textAlign: "right" }}>{originalAmount} Rs.</Typography>

              <Typography variant="body2">Discount Amount:</Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <RemoveRoundedIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">
                  {appliedInfo.discountType === "percent" ? `${appliedInfo.discountAmount} Rs.` : `${appliedInfo.discountAmount} Rs.`}
                </Typography>
              </Box>

              <Box sx={{ my: 1, borderTop: "1px solid #ccc", gridColumn: "1 / -1" }}></Box>

              <Typography variant="body1" sx={{ fontWeight: 700 }}>Final Amount:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, textAlign: "right" }}>₹{appliedInfo.finalAmount}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}


