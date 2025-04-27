import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Helper function to determine if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
              School Payment Dashboard
            </h1>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/") 
                    ? "bg-blue-900 text-white shadow-inner" 
                    : "text-blue-100 hover:text-white hover:bg-blue-700"
                }`}
              >
                Transactions
              </Link>
              
              <Link 
                to="/transaction-details" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/transaction-details") 
                    ? "bg-blue-900 text-white shadow-inner" 
                    : "text-blue-100 hover:text-white hover:bg-blue-700"
                }`}
              >
                By School
              </Link>
              
              <Link 
                to="/check-status" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/check-status") 
                    ? "bg-blue-900 text-white shadow-inner" 
                    : "text-blue-100 hover:text-white hover:bg-blue-700"
                }`}
              >
                Check Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;