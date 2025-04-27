import TransactionDetails from "../components/TransactionDetails";

function TransactionDetailsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">Transactions by School</h2> */}
      <div className="flex-1">
        <TransactionDetails />
      </div>
    </div>
  );
}

export default TransactionDetailsPage;