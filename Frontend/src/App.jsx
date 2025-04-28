import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import CheckStatusPage from "./pages/CheckStatusPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-180px)] p-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/transaction-details" element={<TransactionDetailsPage />} />
                  <Route path="/check-status" element={<CheckStatusPage />} />
                </Route>
              </Routes>
            </div>
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} School Payment Dashboard
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;