import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
      dark: "#004d40",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#004d40",
    },
  },
});

const steps = ["Create Event", "Add Event Details", "Add Tickets", "Add FAQs"];

export default function EventCreationStepper() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [eventId, setEventId] = useState(null);
  // const [message, setMessage] = useState("");

  const [eventData, setEventData] = useState({
    eventName: "",
    description: "",
    view: "public",
    image: null,
    quantity: "",
    dateTime: "",
    location: "",
    tickets: [],
    faqs: [],
  });

  const [ticketData, setTicketData] = useState({
    ticketName: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [faqData, setFaqData] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [ticketQuantityError, setTicketQuantityError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({ message: "You must log in first.", severity: "warning" });
      navigate("/login");
      return;
    }

    let decoded = null;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem("token");
      setAlert({ message: "Invalid token. Please login again.", severity: "error" });
      navigate("/login");
      return;
    }

    const checkExpiration = () => {
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        setAlert({ message: "Session expired. Please login again.", severity: "warning" });
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkExpiration();
    const intervalId = setInterval(checkExpiration, 1000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const validateFields = useMemo(() => {
    return () => {
      let newErrors = {};
      if (activeStep === 0) {
        if (!eventData.eventName.trim()) newErrors.eventName = "Event Name is required";
        if (!eventData.description.trim()) newErrors.description = "Description is required";
        if (!eventData.image) newErrors.image = "Event Image is required";
      } else if (activeStep === 1) {
        if (!eventData.quantity) newErrors.quantity = "Quantity is required";
        if (!eventData.dateTime) newErrors.dateTime = "Date and Time are required";
        if (!eventData.location.trim()) newErrors.location = "Location is required";
      } else if (activeStep === 2) {
        if (eventData.tickets.length === 0) newErrors.tickets = "At least one ticket is required";
      } else if (activeStep === 3) {
        if (eventData.faqs.length === 0) newErrors.faqs = "At least one FAQ is required";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [activeStep, eventData]);

  const handleNext = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({ message: "You are not authorized. Please log in.", severity: "warning" });
      localStorage.removeItem("token")
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        setAlert({ message: "Session expired. Please login again.", severity: "warning" });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
    } catch {
      setAlert({ message: "Invalid session. Please log in.", severity: "error" });
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!validateFields()) return;

    if (activeStep === 0) await handleSubmitEvent();
    else if (activeStep === 1) await handleUpdateEventDetails();
    else if (activeStep === 2) await handleSubmitTickets();
    else if (activeStep === 3) await handleSubmitFaqs();
    else {
      // setMessage("Event Created Successfully!");
      // setAlert({ message: "Event Created Successfully!", severity: "success" });
      // setTimeout(() => {
      //   navigate("/events/dashboard");
      // }, 2000);
    }
  };

  const handleBack = () =>{ 
    if(activeStep === 0){
      navigate("/events/dashboard")
    }else {
    setActiveStep((prev) => prev - 1)};
    }
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
    setAlert({ message: "", severity: "" });
  };

  const handleCheckboxChange = (e) => {
    setEventData((prev) => ({ ...prev, view: e.target.checked ? "private" : "public" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    // Live-validate ticket quantity against event capacity
    if (name === "quantity") {
      const eventCapacity = Number(eventData.quantity || 0);
      const currentTotal = eventData.tickets.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
      const incomingQuantity = Number(value || 0);
      const newTotal = currentTotal + incomingQuantity;

      if (newTotal > eventCapacity) {
        setTicketQuantityError("Total quantity exceeds the allowed limit.");
      } else {
        setTicketQuantityError("");
      }
    }
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTicket = () => {
    const eventCapacity = Number(eventData.quantity || 0);
    const currentTotal = eventData.tickets.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const incomingQuantity = Number(ticketData.quantity || 0);
    const newTotal = currentTotal + incomingQuantity;

    if (!incomingQuantity || incomingQuantity <= 0) {
      setTicketQuantityError("Total quantity exceeds the allowed limit.");
      return;
    }

    if (newTotal > eventCapacity) {
      setTicketQuantityError("Total quantity exceeds the allowed limit.");
      return;
    }

    setEventData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, ticketData],
    }));
    setTicketData({ ticketName: "", description: "", price: "", quantity: "" });
    setTicketQuantityError("");
  };

  const handleFaqChange = (e) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFaq = () => {
    setEventData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, faqData],
    }));
    setFaqData({ title: "", description: "" });
  };

  const handleSubmitEvent = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      Object.keys(eventData).forEach((key) => {
        if (key !== "tickets" && key !== "faqs" && eventData[key]) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await axios.post("http://localhost:4000/api/events/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setEventId(response.data.event._id);
      setAlert({ message: response.data.message, severity: "success" });
      setTimeout(() =>{
        setAlert({message:'',severity:''});
      }, 1500);
      setActiveStep(1);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Error creating event", severity: "error" });
    }
  };

  const handleUpdateEventDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const requestData = { eventId, ...eventData };

      const response = await axios.put("http://localhost:4000/api/events/add-details", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setAlert({ message: response.data.message, severity: "success" });
      setTimeout(()=>{
        setAlert({message:'', severity:''})
      }, 1500)
      setActiveStep(2);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Error updating event details", severity: "error" });
    }
  };

  const handleSubmitTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const requestData = { eventId, tickets: eventData.tickets };

      const response = await axios.put("http://localhost:4000/api/events/add-tickets", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setAlert({ message: response.data.message, severity: "success" });
      setTimeout(()=>{
        setAlert({message:'',severity:''})
      },1500)
      setActiveStep(3);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Error adding tickets", severity: "error" });
    }
  };

  const handleSubmitFaqs = async () => {
    try {
      const token = localStorage.getItem("token");
      const requestData = { eventId, faqs: eventData.faqs };

      const response = await axios.put("http://localhost:4000/api/events/add-faqs", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setAlert({ message: response.data.message, severity: "success" });
      setTimeout(()=>{
        setAlert({message:'',severity:''})
      }, 1500)
      setActiveStep(4);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Error adding FAQs", severity: "error" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f4f4f4" }}>
        <Box sx={{ width: "50%", p: 4, borderRadius: 2, boxShadow: 3, bgcolor: "white", textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "primary.main" }}>
            Create Your Event
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {alert.message && (
            <Stack sx={{ width: "100%", mb: 2}}>
              <Alert
                severity={alert.severity}
                sx={{
                  fontWeight:"bold"
                }}
                onClose={() => setAlert({ message: "", severity: "" })}
              >
                {alert.message}
              </Alert>
            </Stack>
          )}

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "green" }}>
                {alert.message || "Event Created Successfully!"}
              </Typography>
              <Button onClick={() => navigate("/events/dashboard")} sx={{ mt: 3 }} variant="contained" color="primary">
                Go to Dashboard
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {activeStep === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField placeholder="Event Name" fullWidth name="eventName" value={eventData.eventName} onChange={handleChange} error={!!errors.eventName} helperText={errors.eventName} />
                  <TextField placeholder="Description" fullWidth multiline rows={3} name="description" value={eventData.description} onChange={handleChange} error={!!errors.description} helperText={errors.description} />
                   <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography>View:</Typography>
                  <FormControlLabel control={<Checkbox checked={eventData.view === "public"} onChange={handleCheckboxChange} />} label="Public" />
                  <FormControlLabel control={<Checkbox checked={eventData.view === "private"} onChange={handleCheckboxChange} />} label="Private" />
                </Box>                 
                <Box>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {errors.image && (
                    <Typography sx={{ color: "red", mt: 1 }}>{errors.image}</Typography>
                  )}

                  {eventData.image && (
                    <Box sx={{ position: "relative", width: "200px", mt: 2,height: "auto" }}>
                      <img
                        src={URL.createObjectURL(eventData.image)}
                        alt="Event Preview"
                        style={{ width: "100%", borderRadius: "8px" }}
                      />
                      <Button
                        onClick={() =>
                          setEventData((prev) => ({ ...prev, image: null }))
                        }
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          minWidth: "auto",
                          padding: "2px 6px",
                          fontSize: "10px",
                          bgcolor: "#fff",
                          color: "#000",
                          borderRadius: "50%",
                          "&:hover": {
                            bgcolor: "#f44336",
                            color: "#fff",
                          },
                        }}
                      >
                        X
                      </Button>
                    </Box>
                  )}
                </Box>

                  {/* {errors.image && <Typography sx={{ color: "red" }}>{errors.image}</Typography>} */}
                </Box>
              )}

              {activeStep === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField placeholder="Quantity" fullWidth name="quantity" type="number" value={eventData.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} />
                  <TextField placeholder="Date and Time" fullWidth name="dateTime" type="datetime-local" value={eventData.dateTime} onChange={handleChange} error={!!errors.dateTime} helperText={errors.dateTime} />
                  <TextField placeholder="Location" fullWidth name="location" value={eventData.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} />
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField placeholder="Ticket Name" fullWidth name="ticketName" value={ticketData.ticketName} onChange={handleTicketChange} />
                  <TextField placeholder="Description" fullWidth name="description" value={ticketData.description} onChange={handleTicketChange} />
                  <TextField placeholder="Price (in INR)" fullWidth name="price" type="number" value={ticketData.price} onChange={handleTicketChange} />
                  <TextField
                    placeholder="Quantity"
                    fullWidth
                    name="quantity"
                    type="number"
                    value={ticketData.quantity}
                    onChange={handleTicketChange}
                    error={!!ticketQuantityError}
                    helperText={ticketQuantityError || ""}
                  />
                  <Button onClick={handleAddTicket} disabled={!!ticketQuantityError || !ticketData.quantity} sx={{ mt: 2, bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
                    Add Ticket
                  </Button>

                  {eventData.tickets.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Added Tickets:</Typography>
                      {eventData.tickets.map((ticket, index) => (
                        <Box key={index} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, mb: 1, textAlign: "left" }}>
                          <Typography><strong>Ticket Name:</strong> {ticket.ticketName}</Typography>
                          <Typography><strong>Description:</strong> {ticket.description}</Typography>
                          <Typography><strong>Price:</strong> ₹{ticket.price}</Typography>
                          <Typography><strong>Quantity:</strong> {ticket.quantity}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {activeStep === 3 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField placeholder="FAQ Title" fullWidth name="title" value={faqData.title} onChange={handleFaqChange} />
                  <TextField placeholder="FAQ Description" fullWidth multiline rows={3} name="description" value={faqData.description} onChange={handleFaqChange} />
                  <Button onClick={handleAddFaq} sx={{ mt: 2, bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
                    Add FAQ
                  </Button>

                  {eventData.faqs.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Added FAQs:</Typography>
                      {eventData.faqs.map((faq, index) => (
                        <Box key={index} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, mb: 1, textAlign: "left" }}>
                          <Typography><strong>Question: </strong> {faq.title}</Typography>
                          <Typography><strong>Answer: </strong> {faq.description}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "row", pt: 3 }}>
                <Button color="inherit" onClick={handleBack} sx={{ mr: 1, bgcolor: "grey.300", "&:hover": { bgcolor: "grey.400" } }}>Back</Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleNext} sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
