import React, { useState } from 'react';
import { Package, Store } from 'lucide-react';
import DashboardOrdersTable from './DashboardOrdersTable';
import DashboardOutboundStoreTable from './DashboardOutboundStoreTable';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const DashboardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('order-summary');

  const tabs: Tab[] = [
    {
      id: 'order-summary',
      label: 'Order Summary',
      icon: Package,
      component: DashboardOrdersTable
    },
    {
      id: 'outbound-store',
      label: 'Outbound Store',
      icon: Store,
      component: DashboardOutboundStoreTable
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || DashboardOrdersTable;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300 ease-in-out">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default DashboardTabs;