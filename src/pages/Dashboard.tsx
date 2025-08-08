import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import DashboardOrdersTable from '../components/DashboardOrdersTable';


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
        <DashboardOrdersTable />
      </div>
    </div>
  );
};

export default Dashboard;