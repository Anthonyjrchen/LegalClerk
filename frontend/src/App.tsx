import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileSetupWrapper from "./components/ProfileSetupWrapper";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import CreateTrial from "./pages/CreateTrial";
import FormCalculator from "./pages/FormCalculator";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Callback from "./pages/Callback";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/" element={<Login />} />

          {/* Protected routes wrapped with profile setup */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/home"
              element={
                <ProfileSetupWrapper>
                  <Home />
                </ProfileSetupWrapper>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="createTrial" element={<CreateTrial />} />
              <Route path="formCalculator" element={<FormCalculator />} />
              <Route path="profile" element={<Profile />} />
              <Route index element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
