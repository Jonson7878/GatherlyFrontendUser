import React, { useState, useEffect, useMemo, useRef  } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Step,
  StepLabel,
  Stepper,
  Typography,
  IconButton,
  createTheme,
  ThemeProvider,
  Button,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
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

const steps = ["Update Event", "Update Details", "Update Tickets", "Update FAQs"];

export default function UpdateEventStepper() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
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
    quantity: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [faqData, setFaqData] = useState({ title: "", description: "" });
  const [isFaqEditing, setIsFaqEditing] = useState(false);
  const [faqEditIndex, setFaqEditIndex] = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);

  
  useEffect(() => {
    if (eventId) fetchEvent(); // eslint-disable-next-line 
  }, [eventId]);

 useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlert({ message: "You must log in first.", severity: "warning" });
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        setAlert({ message: "Invalid token. Please login again.", severity: "error" });      
        navigate("/login");
      }
    } catch (err) {
      localStorage.removeItem("token");
      setAlert({ message: "Invalid token. Please login again.", severity: "error" });
      navigate("/login");
    }
  }, [navigate]);
    const fetchEvent = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:4000/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const event = res.data.event;
            setEventData({
                eventName: event.eventName || "",
                description: event.description || "",
                view: event.view || "public",
                image: null,
                quantity: event.quantity || "",
                dateTime: event.dateTime || "",
                location: event.location || "",
                tickets: event.tickets || [],
                faqs: event.faqs || [],
            });
            setAlert({ message: "Event loaded successfully!", severity: "success" });
            setTimeout(() => {
                setAlert({ message: '', severity: '' });
            }, 1500);
        } catch (err) {
            console.error("Error loading event:", err);
            const errorMessage = err.response?.data?.message || "Error loading event. Please try again.";
            setAlert({ message: errorMessage, severity: "error" });
            setTimeout(() => {
                setAlert({ message: '', severity: '' });
            }, 1500);
        }
    };

  const validateFields = useMemo(() => {
    return () => {
      let newErrors = {};
      if (activeStep === 0) {
        if (!eventData.eventName.trim()) newErrors.eventName = "Event Name required";
        if (!eventData.description.trim()) newErrors.description = "Description required";
      } else if (activeStep === 1) {
        if (!eventData.quantity) newErrors.quantity = "Quantity required";
        if (!eventData.dateTime) newErrors.dateTime = "Date/Time required";
        if (!eventData.location.trim()) newErrors.location = "Location required";
      } else if (activeStep === 2) {
        if (eventData.tickets.length === 0) newErrors.tickets = "Add at least one ticket";
      } else if (activeStep === 3) {
        if (eventData.faqs.length === 0) newErrors.faqs = "Add at least one FAQ";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [activeStep, eventData]);

      const handleNext = async () => {
        const token = localStorage.getItem("token")
        if(!token){
          setAlert({message: "You are not authorized. Please log in.", severity:"warning"})
          localStorage.removeItem("token");
          navigate("/login")
          return
        }

        try{
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;
          if(decoded.exp < now){
            setAlert({message:"Session expired. Please login again.", severity:"warning"})
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
        } catch{
          setAlert({message:"Invalid session. Please log in.",severity:"error"})
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!validateFields()) return;

        if (activeStep === 0) await handleUpdateEventInfo();
        else if (activeStep === 1) await handleUpdateEventDetails();
        else if (activeStep === 2) await handleUpdateTickets();
        else if (activeStep === 3) {
          await handleUpdateFaqs();
          // setAlert({message: "Event Updated Successfully!", severity:"success"})
          // setTimeout(() =>{
          //  navigate("/events/dashboard");
          // }, 1500);
          return;
        }

        setActiveStep((prev) => prev + 1);
      };

      const handleBack = () => {
        if(activeStep === 0){
          navigate('/events/dashboard')
        }else {
        setActiveStep((prev) => prev - 1)};
        }
      const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData((prev) => ({ ...prev, [name]: value }));
        setAlert({message: "", severity:""});
      };

      const handleCheckboxChange = (e) => {
        setEventData((prev) => ({ ...prev, view: e.target.checked ? "private" : "public" }));
      };

      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setEventData({ ...eventData, image: file });
          setImagePreview(URL.createObjectURL(file));
        }
      };
    
      const handleImageRemove = () => {
        setEventData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
        setInputKey(Date.now());
      };

      const formatDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const pad = (n) => n.toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      };
      
      const handleTicketChange = (e) => {
        const { name, value } = e.target;
        setTicketData((prev) => ({ ...prev, [name]: value }));
      };
      
      const handleAddTicket = () => {
        if (!ticketData.ticketName || !ticketData.price) return;
        setEventData((prev) => ({
          ...prev,
          tickets: [...prev.tickets, ticketData],
        }));
        setTicketData({ ticketName: "", description: "", price: "", quantity: "" });
        setShowTicketForm(false);
        setIsEditing(false);
      };
      
      const handleEditTicket = (index) => {
        setTicketData(eventData.tickets[index]);
        setEditIndex(index);
        setIsEditing(true);
        setShowTicketForm(true);
      }

      const handleUpdateEventInfo = async () => {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("eventName", eventData.eventName);
        formData.append("description", eventData.description);
        formData.append("view", eventData.view);
        if (eventData.image) formData.append("image", eventData.image);

        const response = await axios.put(`http://localhost:4000/api/events/update/basic/${eventId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        setAlert({ message: response.data.message, severity: "success" });

        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);

        setActiveStep(0);
    } catch (err) {
        setAlert({ message: err.response?.data?.message || "Error updating event", severity: "error" });
    }
};

      const handleUpdateEventDetails = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
            `http://localhost:4000/api/events/update/details/${eventId}`,
            {
                quantity: eventData.quantity,
                dateTime: eventData.dateTime,
                location: eventData.location,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setAlert({ message: response.data.message, severity: "success" });

        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);

        setActiveStep(1);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error updating event details", severity: "error" });
    }
};

const handleUpdateTickets = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
            `http://localhost:4000/api/events/update/tickets/${eventId}`,
            { tickets: eventData.tickets },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        setAlert({ message: response.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
        setActiveStep(2);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error Updating tickets", severity: "error" });
    }
};

const handleSaveEditedTicket = async () => {
    try {
        const token = localStorage.getItem("token");

        if (
            editIndex === null ||
            editIndex === undefined ||
            !eventData.tickets ||
            !eventData.tickets[editIndex]
        ) {
            console.error("Invalid edit index or ticket data.");
            return;
        }

        const ticketId = eventData.tickets[editIndex]._id;

        const response = await axios.put(
            `http://localhost:4000/api/events/${eventId}/tickets/${ticketId}`,
            ticketData,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const updatedTickets = [...eventData.tickets];
        updatedTickets[editIndex] = { ...updatedTickets[editIndex], ...ticketData };
        setEventData((prev) => ({ ...prev, tickets: updatedTickets }));

        setShowTicketForm(false);
        setTicketData({ ticketName: "", description: "", price: "", quantity: "" });
        setEditIndex(null);
        setIsEditing(false);
        setAlert({ message: response.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error update ticket.", severity: "error" });
    }
};

const handleDeleteTicket = async (index) => {
    try {
        const token = localStorage.getItem("token");
        const ticketId = eventData.tickets[index]._id;

        const response = await axios.delete(
            `http://localhost:4000/api/events/${eventId}/tickets/${ticketId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const updatedTickets = eventData.tickets.filter((_, i) => i !== index);
        setEventData((prev) => ({ ...prev, tickets: updatedTickets }));
        setAlert({ message: response.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error delete ticket.", severity: "error" });
    }
};
      
      const handleFaqChange = (e) => {
        const { name, value } = e.target;

        setFaqData((prev) => ({ ...prev, [name]: value }));

        if (isFaqEditing && faqEditIndex !== null) {
          setEventData((prev) => {
            const updatedFaqs = [...prev.faqs];
            updatedFaqs[faqEditIndex] = {
              ...updatedFaqs[faqEditIndex],
              [name]: value,
            };
            return { ...prev, faqs: updatedFaqs };
          });
        }
      };

      const handleAddFaq = () => {
        if (!faqData.title || !faqData.description) return;
      
        setEventData((prev) => ({
          ...prev,
          faqs: [...(prev.faqs || []), faqData],
        }));
        setFaqData({ title: "", description: "" });
        setShowFaqForm(false);
        setIsFaqEditing(false);
      };
      
      const handleEditFaq = (index) => {
        setFaqData(eventData.faqs[index]);
        setFaqEditIndex(index);
        setIsFaqEditing(true);
        setShowFaqForm(true);
      };

const handleUpdateFaqs = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
            `http://localhost:4000/api/events/update/faqs/${eventId}`,
            {
                faqs: eventData.faqs,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            });
        setAlert({ message: response.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
        setActiveStep(4);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error FAQs updating.", severity: "error" });
    }
};

const handleSaveEditedFeqs = async () => {
    try {
        const token = localStorage.getItem("token");

        const faqToEdit = eventData.faqs?.[faqEditIndex];
        if (!faqToEdit) {
            throw new Error("FAQ not found for editing.");
        }

        const faqId = faqToEdit._id;

        const editedFaq = {
            title: faqData.title,
            description: faqData.description,
        };

        const res = await axios.put(
            `http://localhost:4000/api/events/${eventId}/faqs/${faqId}`,
            editedFaq,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        const updatedFaq = res.data.faq;
        const updatedFaqs = [...eventData.faqs];
        updatedFaqs[faqEditIndex] = updatedFaq;

        setEventData((prev) => ({
            ...prev,
            faqs: updatedFaqs,
        }));

        setFaqData({ title: "", description: "" });
        setFaqEditIndex(null);
        setIsFaqEditing(false);
        setShowFaqForm(false);
        setAlert({ message: res.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
    } catch (err) {
        console.error("Error updating FAQ:", err);
        setAlert({ message: err.response?.data?.message || "Failed to update FAQ.", severity: "error" });
    }
};

const handleDeleteFaq = async (index) => {
    try {
        const token = localStorage.getItem("token");
        const faqId = eventData.faqs[index]._id;

        const response = await axios.delete(
            `http://localhost:4000/api/events/${eventId}/faqs/${faqId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const updatedFaqs = eventData.faqs.filter((_, i) => i !== index);
        setEventData((prev) => ({ ...prev, faqs: updatedFaqs }));

        if (faqEditIndex === index) {
            setFaqData({ title: "", description: "" });
            setIsFaqEditing(false);
            setFaqEditIndex(null);
            setShowFaqForm(false);
        }
        setAlert({ message: response.data.message, severity: "success" });
        setTimeout(() => {
            setAlert({ message: '', severity: '' });
        }, 1500);
    } catch (error) {
        setAlert({ message: error.response?.data?.message || "Error delete faqs", severity: "error" });
    }
};
    
  return (
  <ThemeProvider theme={theme}>
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f4f4f4" }}>
      <Box sx={{ width: "50%", p: 4, borderRadius: 2, boxShadow: 3, bgcolor: "white", textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "primary.main" }}>Update Event</Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      {alert.message && (
        <Stack sx={{width: "100%",mb:2}}>
          <Alert severity={alert.severity} sx={{fontWeight:"bold"}}
          onClose={()=> setAlert({message:"",severity:""})}
          >
            {alert.message}
            </Alert>
          </Stack>
      )}

      <Box mt={3}>
        {activeStep === 0 && (
          <Box>
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              value={eventData.eventName}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            {errors.eventName && <Typography color="error">{errors.eventName}</Typography>}

            <textarea
              name="description"
              placeholder="Description"
              value={eventData.description}
              onChange={handleChange}
              rows={4}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            {errors.description && <Typography color="error">{errors.description}</Typography>}

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography>View:</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.view === "public"}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Public"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.view === "private"}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Private"
              />
            </Box>

            <input
              key={inputKey}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ marginTop: "10px" }}
            />

            {imagePreview && (
              <Box
                sx={{
                  position: "relative",
                  marginTop: 2,
                  width: "200px",
                  height: "auto",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Selected"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <IconButton
                  onClick={handleImageRemove}
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
                    }
                  }}
                >
                  {/* <CloseIcon /> */}
                  X
                </IconButton>
              </Box>
            )}
          </Box>
        )}
        {activeStep === 1 && (
          <>
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={eventData.quantity}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
              type="datetime-local"
              name="dateTime"
              placeholder="Date & Time"
              value={formatDateTimeLocal(eventData.dateTime)}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={eventData.location}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
          </>
        )}
        {activeStep === 2 && (
          <>
            {!showTicketForm && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setTicketData({ ticketName: "", description: "", price: "", quantity: "" });
                  setShowTicketForm(true);
                }}
                style={{
                  padding: "6px 14px",
                  fontSize: "14px",
                  marginBottom: "10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add Ticket
              </button>
            )}

            {showTicketForm && (
              <>
                <input
                  type="text"
                  name="ticketName"
                  placeholder="Ticket Name"
                  value={ticketData.ticketName}
                  onChange={handleTicketChange}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <textarea
                  name="description"
                  placeholder="Ticket Description"
                  value={ticketData.description}
                  onChange={handleTicketChange}
                  rows={3}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={ticketData.price}
                  onChange={handleTicketChange}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={ticketData.quantity}
                  onChange={handleTicketChange}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={isEditing ? handleSaveEditedTicket : handleAddTicket}
                    style={{
                      padding: "6px 14px",
                      fontSize: "14px",
                      backgroundColor: isEditing ? "#007bff" : "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {isEditing ? "Save Ticket" : "Add Ticket"}
                  </button>

                  <button
                    onClick={() => {
                      setShowTicketForm(false);
                      setTicketData({ ticketName: "", description: "", price: "", quantity: "" });
                      setIsEditing(false);
                    }}
                    style={{
                      padding: "6px 14px",
                      fontSize: "14px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {eventData.tickets?.map((ticket, index) => (
              <div
                key={index}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  textAlign:"left",
                  fontWeight:"400"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{ticket.ticketName}</strong>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEditTicket(index)}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(index)}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}>
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: "8px"}}>Description: <strong>{ticket.description}</strong></div>
                <div>Price: <strong>₹{ticket.price}</strong></div>
                <div>Quantity: <strong>{ticket.quantity}</strong></div>
              </div>
            ))}

            {errors.tickets && (
              <div style={{ color: "red", marginTop: "10px" }}>{errors.tickets}</div>
            )}
          </>
        )}
        {activeStep === 3 && (
          <>
            {!showFaqForm && (
            <button
              onClick={() => {
                setIsFaqEditing(false);
                setFaqData({ title: "", description: "" });
                setShowFaqForm(true);
              }}
              style={{
                padding: "6px 14px",
                fontSize: "14px",
                marginBottom: "10px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add FAQ
            </button>
            )}
            {showFaqForm && (
              <>
                <input
                  type="text"
                  name="title"
                  placeholder="FAQ Title"
                  value={faqData.title}
                  onChange={handleFaqChange}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <textarea
                  name="description"
                  placeholder="FAQ Description"
                  value={faqData.description}
                  onChange={handleFaqChange}
                  rows={3}
                  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={isFaqEditing ? handleSaveEditedFeqs : handleAddFaq}
                    style={{
                      padding: "6px 14px",
                      fontSize: "14px",
                      backgroundColor: isFaqEditing ? "#007bff" : "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {isFaqEditing ? "Save FAQ" : "Add FAQ"}
                  </button>

                  <button
                    onClick={() => {
                      setShowFaqForm(false);
                      setFaqData({ title: "", description: "" });
                      setIsFaqEditing(false);
                    }}
                    style={{
                      padding: "6px 14px",
                      fontSize: "14px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

        {Array.isArray(eventData.faqs) && eventData.faqs.length > 0 ? (
          eventData.faqs.map((faq, index) => (
            <div
              key={faq?._id || index}
              style={{
                marginTop: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "400" }}>
              Question: <strong>{faq?.title?.trim() !== "" ? faq.title : "Untitled FAQ"}</strong>
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleEditFaq(index)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteFaq(index)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <div
            style={{
              marginTop: "3px",
              fontWeight: "400",
              textAlign: "left",
            }}
          >
            Answer: <strong>{faq?.description || "No description provided"}</strong>
          </div>
        </div>
        ))
        ) : (
          <p style={{ marginTop: "10px", color: "#777" }}>No FAQs added yet.</p>
            )}

          {errors.faqs && (
            <div style={{ color: "red", marginTop: "10px" }}>{errors.faqs}</div>
          )}
        </>
        )}
        {activeStep === steps.length ? (
                    <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "green" }}>
                            {alert.message || "Event Updated Successfully!"}
                        </Typography>
                        <Button onClick={() => navigate("/events/dashboard")} sx={{ mt: 3 }} variant="contained" color="primary">
                            Go to Dashboard
                        </Button>
                    </Box>
                ) : (
                    <Box mt={4} display="flex" justifyContent="space-between">
                        <button onClick={handleBack} style={{ padding: "10px 20px" }}>
                            Back
                        </button>
                        <button onClick={handleNext} style={{ padding: "10px 20px" }}>
                            {activeStep === steps.length - 1 ? "Finish" : "Next"}
                        </button>
                    </Box>
                )}

        {/* {message && (
          <Typography color="green" mt={2}>{message}</Typography>
        )} */}
      </Box>
      </Box>
    </Box>
  </ThemeProvider>
  );
}