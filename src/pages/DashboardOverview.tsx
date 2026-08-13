export default function DashboardOverview() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-medium">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium text-sm">
            AD
          </div>
        </div>
      </header>
      
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-neutral-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-medium mt-2">Rs. 0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-neutral-500 text-sm font-medium">Active Orders</h3>
            <p className="text-3xl font-medium mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-neutral-500 text-sm font-medium">Products</h3>
            <p className="text-3xl font-medium mt-2">0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[400px] flex items-center justify-center text-neutral-400">
          Chart / Data Grid Area
        </div>
      </div>
    </div>
  );
}
