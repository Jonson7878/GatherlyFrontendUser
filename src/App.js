import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ResetLink from './pages/ResetLink';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Adduser from './pages/Dashboard/Add-user';
import UserTable from './pages/Dashboard/User-table';
import UpdateUser from './pages/Dashboard/Update-user';
import TaskTabel from './pages/task/Task-table'
import CreateTask from './pages/task/Create-task';
import UpdateTask from './pages/task/Update-task';
import { UserProvider } from './components/UserContext';
import EventTabel from './pages/event/Event-table'
import CreateEvent from './pages/event/create-event';
import EventDetails from './pages/event/EventDetails';
import UpdateEvent from './pages/event/UpdateEvent';
import OrderDetails from './pages/Order/OrderDetails';
import Checkout from './pages/Order/Checkout';
import UpdateOrder from './pages/Order/UpdateOrder'
import OrdersList from './pages/Order/Order-table';
import PaymentPage from './pages/Order/PaymentPage';
import CartTable from './pages/Order/Cart-table';
import Authenticator from './pages/Authenticator';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/authenticator" element={<Authenticator />} />
          <Route path="/resetlink" element={<ResetLink />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/:view/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard"
            element={
              <Navigate
                to={`/${localStorage.getItem('lastDashboardView') || 'company'}/dashboard`}
                replace
              />
            }
          />
          <Route path="/add-user" element={<Adduser />} />
          <Route path="/user-table" element={<UserTable />} />
          <Route path="/update-user/:id" element={<UpdateUser />} />
          <Route path="/task-table" element={<TaskTabel />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/update-task/:id" element={<UpdateTask />} />
          <Route path="/event-table" element={<EventTabel />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/update-event/:eventId" element={<UpdateEvent />} />
          <Route path="/update-order/:id" element={<UpdateOrder />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/order-table" element={<OrdersList />} />
          <Route path="/carts-table" element={<CartTable />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
