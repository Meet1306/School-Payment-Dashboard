import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import CheckStatusPage from "./pages/CheckStatusPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          {/* Fixed-width container with consistent min-height */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            <div className="bg-white rounded-xl shadow-sm min-h-[70vh] p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/transaction-details" element={<TransactionDetailsPage />} />
                <Route path="/check-status" element={<CheckStatusPage />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;