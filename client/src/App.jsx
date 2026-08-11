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

const App = () => {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route element={<AppLayout />}>

            <Route
              path="/"
              element={<Dashboard />}
            />
            <Route
  path="/patients"
  element={<Patients />}
/>

          </Route>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
};

export default App;