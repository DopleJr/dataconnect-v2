import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import DashboardOrdersTable from '../components/DashboardOrdersTable';

// Sample data - replace with actual API call
const sampleOrderData = [
  { CREATION_DATE: '2025-08-01', ORDER_TYPE: 'B2C_COM', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 57, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 141, Total_Order: 57, Total_Qty: 141 },
  { CREATION_DATE: '2025-08-01', ORDER_TYPE: 'B2C_SHP', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 1114, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 1791, Total_Order: 1114, Total_Qty: 1791 },
  { CREATION_DATE: '2025-08-01', ORDER_TYPE: 'B2C_ZLR', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 322, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 654, Total_Order: 322, Total_Qty: 654 },
  { CREATION_DATE: '2025-08-02', ORDER_TYPE: 'B2C_COM', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 78, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 186, Total_Order: 78, Total_Qty: 186 },
  { CREATION_DATE: '2025-08-02', ORDER_TYPE: 'B2C_SHP', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 1226, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 2118, Total_Order: 1226, Total_Qty: 2118 },
  { CREATION_DATE: '2025-08-02', ORDER_TYPE: 'B2C_ZLR', Released_Ord: 0, Allocated_Ord: 0, Packed_Ord: 0, Shipped_Ord: 479, Released_Qty: 0, Allocated_Qty: 0, Packed_Qty: 0, Shipped_Qty: 1213, Total_Order: 479, Total_Qty: 1213 },
  { CREATION_DATE: '2025-08-07', ORDER_TYPE: 'B2C_COM', Released_Ord: 0, Allocated_Ord: 24, Packed_Ord: 0, Shipped_Ord: 47, Released_Qty: 0, Allocated_Qty: 95, Packed_Qty: 0, Shipped_Qty: 86, Total_Order: 71, Total_Qty: 181 },
  { CREATION_DATE: '2025-08-07', ORDER_TYPE: 'B2C_ZLR', Released_Ord: 0, Allocated_Ord: 1, Packed_Ord: 7, Shipped_Ord: 292, Released_Qty: 0, Allocated_Qty: 5, Packed_Qty: 16, Shipped_Qty: 575, Total_Order: 300, Total_Qty: 596 },
  { CREATION_DATE: '2025-08-08', ORDER_TYPE: 'B2C_COM', Released_Ord: 0, Allocated_Ord: 128, Packed_Ord: 0, Shipped_Ord: 34, Released_Qty: 0, Allocated_Qty: 409, Packed_Qty: 0, Shipped_Qty: 56, Total_Order: 162, Total_Qty: 465 },
  { CREATION_DATE: '2025-08-08', ORDER_TYPE: 'B2C_SHP', Released_Ord: 0, Allocated_Ord: 1664, Packed_Ord: 25, Shipped_Ord: 0, Released_Qty: 0, Allocated_Qty: 2842, Packed_Qty: 38, Shipped_Qty: 0, Total_Order: 1689, Total_Qty: 2880 }
];


const StatCard = ({ title, value, icon: Icon, color, loading }: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
    color === 'blue' ? 'border-blue-500' :
    color === 'green' ? 'border-green-500' : 'border-red-500'
  }`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${
        color === 'blue' ? 'bg-blue-100 text-blue-600' :
        color === 'green' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        {loading ? (
          <div className="animate-pulse mt-1">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ) : (
          <p className="text-2xl font-semibold">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInbound: 0,
    totalOutbound: 0,
    dbStatus: 'unknown'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Inventory',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Total Inbound',
      value: stats.totalInbound,
      icon: ArrowDownCircle,
      color: 'green'
    },
    {
      title: 'Total Outbound',
      value: stats.totalOutbound,
      icon: ArrowUpCircle,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm">
          {loading ? (
            <div className="animate-pulse flex items-center space-x-2">
              <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <span className={`inline-block w-3 h-3 rounded-full ${
                stats.dbStatus === 'connected' ? 'bg-green-500' : 
                stats.dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              <span className="text-gray-600">
                {stats.dbStatus === 'connected' ? 'Database Connected' : 
                 stats.dbStatus === 'error' ? 'Database Error' : 'Checking Status...'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            loading={loading}
          />
        ))}
      </div>

      <div className="mt-8">
        <DashboardOrdersTable data={sampleOrderData} />
      </div>
    </div>
  );
};

export default Dashboard;