import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import AppLayout from "./components/layout/AppLayout";

import Patients from "./pages/Patients";
import Appointments from "./pages/appointments/Appointments";
import Consultations from "./pages/consultations/Consultations";
import Billing from "./pages/Billing";
import Medicines from "./pages/Medicines";

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
  path="/medicines"
  element={<Medicines />}
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