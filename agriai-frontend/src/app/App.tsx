import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Layout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import FarmManagement from "./components/FarmManagement";
import SoilAnalysis from "./components/SoilAnalysis";
import CropRecommendation from "./components/CropRecommendation";
import FertilizerRecommendation from "./components/FertilizerRecommendation";
import DiseaseDetection from "./components/DiseaseDetection";
import YieldPrediction from "./components/YieldPrediction";
import Weather from "./components/Weather";
import PredictionHistory from "./components/PredictionHistory";
import Feedback from "./components/Feedback";
import ProfileSettings from "./components/ProfileSettings";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>}
          />
          <Route
            path="/farms"
            element={<AuthenticatedLayout><FarmManagement /></AuthenticatedLayout>}
          />
          <Route
            path="/soil-analysis"
            element={<AuthenticatedLayout><SoilAnalysis /></AuthenticatedLayout>}
          />
          <Route
            path="/crop-recommendation"
            element={<AuthenticatedLayout><CropRecommendation /></AuthenticatedLayout>}
          />
          <Route
            path="/fertilizer"
            element={<AuthenticatedLayout><FertilizerRecommendation /></AuthenticatedLayout>}
          />
          <Route
            path="/disease-detection"
            element={<AuthenticatedLayout><DiseaseDetection /></AuthenticatedLayout>}
          />
          <Route
            path="/yield-prediction"
            element={<AuthenticatedLayout><YieldPrediction /></AuthenticatedLayout>}
          />
          <Route
            path="/weather"
            element={<AuthenticatedLayout><Weather /></AuthenticatedLayout>}
          />
          <Route
            path="/history"
            element={<AuthenticatedLayout><PredictionHistory /></AuthenticatedLayout>}
          />
          <Route
            path="/feedback"
            element={<AuthenticatedLayout><Feedback /></AuthenticatedLayout>}
          />
          <Route
            path="/settings"
            element={<AuthenticatedLayout><ProfileSettings /></AuthenticatedLayout>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
