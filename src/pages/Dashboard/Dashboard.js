import * as React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import logo from "../../assets/logo.png";
import UserTable from "./User-table";
import TaskTable from "../task/Task-table";
import EventTable from "../event/Event-table";
import OrderTable from "../Order/Order-table";
import CartTable from "../Order/Cart-table";
import "../../App.css";

const drawerWidth = 280;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  backgroundColor: "#e8d5f2",
  backgroundImage: `
    linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.05) 25%, rgba(196, 181, 253, 0.1) 50%, rgba(221, 214, 254, 0.05) 75%, rgba(245, 243, 255, 0.1) 100%),
    radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(196, 181, 253, 0.08) 0%, transparent 50%)
  `,
  backgroundSize: "100% 100%, 300px 300px, 250px 250px, 200px 200px",
  backgroundPosition: "0 0, 0 0, 100% 0, 50% 50%",
  boxShadow: "inset -2px 0 10px rgba(147, 51, 234, 0.1), 4px 0 20px rgba(0, 0, 0, 0.05)",
  ...openedMixin(theme),
  "& .MuiDrawer-paper": {
    backgroundColor: "#e8d5f2",
    backgroundImage: `
      linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.05) 25%, rgba(196, 181, 253, 0.1) 50%, rgba(221, 214, 254, 0.05) 75%, rgba(245, 243, 255, 0.1) 100%),
      radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(196, 181, 253, 0.08) 0%, transparent 50%)
    `,
    backgroundSize: "100% 100%, 300px 300px, 250px 250px, 200px 200px",
    backgroundPosition: "0 0, 0 0, 100% 0, 50% 50%",
    borderRight: "1px solid rgba(147, 51, 234, 0.2)",
    boxShadow: "inset -2px 0 10px rgba(147, 51, 234, 0.1), 4px 0 20px rgba(0, 0, 0, 0.05)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
      pointerEvents: "none",
    },
    ...openedMixin(theme),
  },
}));

export default function MiniDrawer() {
  const navigate = useNavigate();
  const { view } = useParams();
  const open = true;

  React.useEffect(() => {
    if (view) {
      localStorage.setItem("lastDashboardView", view);
    } else {
      const lastView = localStorage.getItem("lastDashboardView") || "company";
      navigate(`/${lastView}/dashboard`, { replace: true });
    }
  }, [view, navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    if (view === "users") return <UserTable />;
    if (view === "tasks") return <TaskTable />;
    if (view === "events") return <EventTable />;
    if (view === "orders") return <OrderTable />;
    if (view === "carts") return <CartTable />;
    
    const lastView = localStorage.getItem("lastDashboardView") || "users";
    return <Navigate to={`/${lastView}/dashboard`} replace />;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Box
            sx={{
              display: "flex",
              fontFamily: "'Pacifico', cursive",
              backgroundColor: "transparent",
              fontWeight:"500",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              fontSize: "1.5rem",
              color: "#993399",
              letterSpacing: "1px",
              userSelect: "none",
              paddingLeft: 0,
              p: 0,
            }}
          >
            <img
              src={logo}
              alt="Company Logo"
              style={{ height: 90, objectFit: "contain", display: "block", margin: "0 auto", backgroundColor: "transparent"}}
            />
          </Box>
        </DrawerHeader>
        <Divider sx={{
          my: 1.5,
          height: 2,
          border: 0,
          borderRadius: "999px",
          background: "linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.3) 20%, rgba(168, 85, 247, 0.4) 50%, rgba(147, 51, 234, 0.3) 80%, transparent 100%)",
          opacity: 0.8,
          boxShadow: "0 2px 4px rgba(147, 51, 234, 0.1)"
        }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/users/dashboard")}
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                margin: "6px 12px",
                fontWeight: 600,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(147, 51, 234, 0.1)",
                  color: "#7c3aed",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(147, 51, 234, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#2e7d32" }}>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/tasks/dashboard")}
              sx={{
                fontFamily: "'Roboto Slab', serif",
                margin: "6px 12px",
                fontWeight: 600,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(168, 85, 247, 0.1)",
                  color: "#8b5cf6",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#f57c00" }}>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Tasks" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/events/dashboard")}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                margin: "6px 12px",
                fontWeight: 700,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(196, 181, 253, 0.15)",
                  color: "#6d28d9",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(196, 181, 253, 0.3)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#3949ab" }}>
                <EventAvailableOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Events" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
          <ListItemButton
              onClick={() => navigate("/orders/dashboard")}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                margin: "6px 12px",
                fontWeight: 700,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(221, 214, 254, 0.15)",
                  color: "#5b21b6",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(221, 214, 254, 0.3)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#1e88e5" }}>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/carts/dashboard")}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                margin: "6px 12px",
                fontWeight: 700,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(221, 214, 254, 0.15)",
                  color: "#5b21b6",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(221, 214, 254, 0.3)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#3e2723" }}>
                <ShoppingBagIcon />
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{
          my: 1.5,
          height: 2,
          border: 0,
          borderRadius: "999px",
          background: "linear-gradient(90deg, transparent 0%, rgba(147, 51, 234, 0.3) 20%, rgba(168, 85, 247, 0.4) 50%, rgba(147, 51, 234, 0.3) 80%, transparent 100%)",
          opacity: 0.8,
          boxShadow: "0 2px 4px rgba(147, 51, 234, 0.1)"
        }} />
        <List>
        <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                fontFamily: "'Roboto Slab', serif",
                margin: "6px 12px",
                fontWeight: 600,
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                  transform: "translateX(4px)",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#d32f2f" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <DrawerHeader />
        {renderContent()}
      </Box>
    </Box>
  );
}