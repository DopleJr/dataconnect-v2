import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({
    inventory: false,
    inbound: false,
    outbound: false
  });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle auto-hide functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (!isCollapsed) {
          setIsAutoHidden(true);
        }
      }
    };

    const handleMouseEnter = () => {
      if (isAutoHidden) {
        setIsAutoHidden(false);
      }
    };

    const handleMouseLeave = () => {
      if (!isCollapsed) {
        const timer = setTimeout(() => {
          setIsAutoHidden(true);
        }, 1000); // Auto-hide after 1 second of no interaction

        return () => clearTimeout(timer);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener('mouseenter', handleMouseEnter);
      sidebarElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (sidebarElement) {
        sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
        sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isCollapsed, isAutoHidden]);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  const mainMenuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
  ];

  const inventorySubmenuItems = [
    { path: '/stockinventory', icon: Package, label: 'Stock-Inventory' },
    { path: '/stockinbound', icon: ArrowDownCircle, label: 'Stock-Inbound' },
    { path: '/stockoutbound', icon: ArrowUpCircle, label: 'Stock-Outbound' },
    { path: '/tracetransaction', icon: Package, label: 'Trace Transaction' },
  ];

  const inboundSubmenuItems = [
    { path: '/inboundallocation', icon: ArrowDownCircle, label: 'Inbound-Allocation' },
  ];

  const outboundSubmenuItems = [
    { path: '/outboundorders', icon: ArrowUpCircle, label: 'Outbound-Order' },
  ];

  const toggleSubmenu = (menu: keyof typeof openSubmenus) => {
    // Don't open submenus when sidebar is auto-hidden
    if (isAutoHidden) return;
    
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const renderSubmenu = (menuName: keyof typeof openSubmenus, items: typeof inventorySubmenuItems, Icon: React.ComponentType<any>) => {
    if (isCollapsed || isAutoHidden) {
      return (
        <li className="relative group" key={menuName}>
          <button
            onClick={() => toggleSubmenu(menuName)}
            className="flex items-center justify-center w-full px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            title={menuName}
            aria-label={`${menuName} menu`}
          >
            <Icon className="h-5 w-5" />
          </button>
          {openSubmenus[menuName] && !isAutoHidden && (
            <div className="absolute left-full top-0 ml-1 w-48 bg-blue-600 rounded-lg shadow-lg py-2 z-10">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-4 py-2 text-sm hover:bg-blue-700"
                  title={item.label}
                  aria-label={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={menuName}>
        <button
          onClick={() => toggleSubmenu(menuName)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          aria-label={`${menuName} menu`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <span>Menu-{menuName.charAt(0).toUpperCase() + menuName.slice(1)}</span>
          </div>
          {openSubmenus[menuName] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {openSubmenus[menuName] && (
          <ul className="pl-8 mt-2 space-y-2">
            {items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm ${isActive(item.path)}`}
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div 
      ref={sidebarRef}
      className={`bg-blue-600 text-white ${
        isCollapsed ? 'w-16' : isAutoHidden ? 'w-16' : 'w-64'
      } min-h-screen flex flex-col transition-all duration-300 ${
        isAutoHidden ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className={`p-4 flex items-center ${isCollapsed || isAutoHidden ? 'justify-center' : 'space-x-2'}`}>
        <Database className="h-8 w-8" />
        {!isCollapsed && !isAutoHidden && <span className="text-xl font-bold">DataConnect</span>}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed || isAutoHidden ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive(item.path)}`}
                title={isCollapsed || isAutoHidden ? item.label : ''}
                aria-label={item.label}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed || isAutoHidden ? 'mx-auto' : ''}`} />
                {!isCollapsed && !isAutoHidden && <span>{item.label}</span>}
              </Link>
            </li>
          ))}

          {renderSubmenu('inventory', inventorySubmenuItems, Package)}
          {renderSubmenu('inbound', inboundSubmenuItems, ArrowDownCircle)}
          {renderSubmenu('outbound', outboundSubmenuItems, ArrowUpCircle)}
        </ul>
      </nav>

      <button
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          setIsAutoHidden(false);
        }}
        className="p-4 hover:bg-blue-700 transition-colors duration-200 flex justify-center"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed || isAutoHidden ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default Sidebar;