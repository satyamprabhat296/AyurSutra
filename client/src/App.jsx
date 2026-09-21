import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Reports from "./pages/reports/Reports";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import AppLayout from "./components/layout/AppLayout";

import Patients from "./pages/Patients";
import Appointments from "./pages/appointments/Appointments";
import Consultations from "./pages/consultations/Consultations";
import Billing from "./pages/Billing";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import Pharmacy from "./pages/pharmacy/Pharmacy";
import Prescriptions from "./pages/prescriptions/Prescriptions";

const App = () => {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ==============================
              AUTH
          ============================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==============================
              PROTECTED APPLICATION
          ============================== */}

          <Route element={<AppLayout />}>

            {/* Dashboard */}
            <Route
              path="/"
              element={<Dashboard />}
            />
            <Route
  path="/inventory"
  element={<Inventory />}
/>
<Route
  path="/pharmacy"
  element={<Pharmacy />}
/>

<Route
  path="/medicines"
  element={<Medicines />}
/>

<Route
  path="/prescriptions"
  element={<Prescriptions />}
/>

<Route
  path="/purchases"
  element={<Purchases />}
/>
            {/* Patients */}
            <Route
              path="/patients"
              element={<Patients />}
            />


            {/* Appointments */}
            <Route
              path="/appointments"
              element={<Appointments />}
            />
<Route
  path="/billing"
  element={<Billing />}
/>
<Route
  path="/reports"
  element={<Reports />}
/>

            {/* Consultations */}
            <Route
              path="/consultations"  
              element={<Consultations />} 
            />

          </Route>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
};


export default App; 