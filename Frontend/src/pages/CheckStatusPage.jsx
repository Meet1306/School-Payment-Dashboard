import TransactionStatus from "../components/TransactionStatus";

function CheckStatusPage() {
  return (
    <div className="h-full flex flex-col">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">Check Transaction Status</h2> */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <TransactionStatus />
        </div>
      </div>
    </div>
  );
}

export default CheckStatusPage;