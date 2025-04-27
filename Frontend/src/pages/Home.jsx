import TransactionTable from "../components/TransactionTable";

function Home() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Transactions</h2>
      <div className="flex-1">
        <TransactionTable />
      </div>
    </div>
  );
}

export default Home;