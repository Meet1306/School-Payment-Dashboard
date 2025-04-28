import { useAuth } from "../context/AuthContext";
import TransactionTable from "../components/TransactionTable";

function Home() {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col space-y-6">
      {user && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800">
            Welcome back, {user.name}!
          </h2>
          <p className="text-blue-600">Email: {user.email}</p>
        </div>
      )}
      
      <h2 className="text-2xl font-semibold text-gray-800">All Transactions</h2>
      <div className="flex-1">
        <TransactionTable />
      </div>
    </div>
  );
}

export default Home;