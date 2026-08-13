import { Activity, Package, ShoppingBag, Users } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-800 font-sans">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="text-xl font-medium tracking-tight text-neutral-900">Hanaz Official</h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-brand-50 text-brand-700 rounded-md font-medium text-sm transition-colors">
            <Activity size={18} />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-md font-medium text-sm transition-colors">
            <Package size={18} />
            Products
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-md font-medium text-sm transition-colors">
            <ShoppingBag size={18} />
            Orders
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-md font-medium text-sm transition-colors">
            <Users size={18} />
            Customers
          </a>
        </nav>
      </aside>

      {/* Main Content Placeholder */}
      <main className="flex-1 overflow-auto">
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
      </main>
    </div>
  )
}

export default App
