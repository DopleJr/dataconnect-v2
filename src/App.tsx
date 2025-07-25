import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StockInventory from './pages/StockInventory';
import StockInbound from './pages/StockInbound';
import StockOutbound from './pages/StockOutbound';
import TraceTransaction from './pages/TraceTransaction';
import InboundAllocation from './pages/InboundAllocation';
import OutboundOrders from './pages/OutboundOrders';
import DatabaseStatus from './components/DatabaseStatus';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Toaster position="top-right" />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stockinventory" element={<StockInventory />} />
              <Route path="/stockinbound" element={<StockInbound />} />
              <Route path="/stockoutbound" element={<StockOutbound />} />
              <Route path="/tracetransaction" element={<TraceTransaction />} />

              <Route path="/inboundallocation" element={<InboundAllocation />} />
              <Route path="/outboundorders" element={<OutboundOrders />} />
            </Routes>
          </main>
          <DatabaseStatus />
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;