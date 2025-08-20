import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import TemplateBuilder from "./pages/TemplateBuilder";
import TrialScheduler from "./pages/TrialScheduler";
import Home from "./pages/Home";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/home" element={<Home />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="templateBuilder" element={<TemplateBuilder />} />
            <Route path="trialScheduler" element={<TrialScheduler />} />
            <Route index element={<Dashboard />} />
          </Route>
          {/* </Route> */}
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
