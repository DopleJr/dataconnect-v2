import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import DashboardOrdersTable from '../components/DashboardOrdersTable';

// Sample data - replace with actual API call
const sampleOrderData = [
  { CREATION_DATE: '2025-01-08', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 57, SUM_ORDER: 141 },
  { CREATION_DATE: '2025-01-08', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 1114, SUM_ORDER: 1791 },
  { CREATION_DATE: '2025-01-08', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 322, SUM_ORDER: 654 },
  { CREATION_DATE: '2025-01-09', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 78, SUM_ORDER: 186 },
  { CREATION_DATE: '2025-01-09', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 1226, SUM_ORDER: 2118 },
  { CREATION_DATE: '2025-01-09', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 479, SUM_ORDER: 1213 },
  { CREATION_DATE: '2025-01-10', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 86, SUM_ORDER: 187 },
  { CREATION_DATE: '2025-01-10', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 538, SUM_ORDER: 944 },
  { CREATION_DATE: '2025-01-10', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 476, SUM_ORDER: 1080 },
  { CREATION_DATE: '2025-01-11', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 88, SUM_ORDER: 242 },
  { CREATION_DATE: '2025-01-11', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 2123, SUM_ORDER: 3417 },
  { CREATION_DATE: '2025-01-11', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 398, SUM_ORDER: 870 },
  { CREATION_DATE: '2025-01-12', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 80, SUM_ORDER: 221 },
  { CREATION_DATE: '2025-01-12', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 1186, SUM_ORDER: 1947 },
  { CREATION_DATE: '2025-01-12', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 405, SUM_ORDER: 919 },
  { CREATION_DATE: '2025-01-12', ORDER_TYPE: 'TO_B2B', DO_DESC: 'Shipped', COUNT_ORDER: 4, SUM_ORDER: 8298 },
  { CREATION_DATE: '2025-01-13', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 73, SUM_ORDER: 188 },
  { CREATION_DATE: '2025-01-13', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 897, SUM_ORDER: 1410 },
  { CREATION_DATE: '2025-01-13', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 379, SUM_ORDER: 858 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Allocated', COUNT_ORDER: 24, SUM_ORDER: 95 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 47, SUM_ORDER: 86 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Shipped', COUNT_ORDER: 1093, SUM_ORDER: 1700 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Allocated', COUNT_ORDER: 1, SUM_ORDER: 5 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Packed', COUNT_ORDER: 7, SUM_ORDER: 16 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'B2C_ZLR', DO_DESC: 'Shipped', COUNT_ORDER: 292, SUM_ORDER: 575 },
  { CREATION_DATE: '2025-01-14', ORDER_TYPE: 'TO_B2B', DO_DESC: 'Shipped', COUNT_ORDER: 1, SUM_ORDER: 10 },
  { CREATION_DATE: '2025-01-15', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Allocated', COUNT_ORDER: 128, SUM_ORDER: 409 },
  { CREATION_DATE: '2025-01-15', ORDER_TYPE: 'B2C_COM', DO_DESC: 'Shipped', COUNT_ORDER: 34, SUM_ORDER: 56 },
  { CREATION_DATE: '2025-01-15', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Allocated', COUNT_ORDER: 1664, SUM_ORDER: 2842 },
  { CREATION_DATE: '2025-01-15', ORDER_TYPE: 'B2C_SHP', DO_DESC: 'Packed', COUNT_ORDER: 25, SUM_ORDER: 38 }
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