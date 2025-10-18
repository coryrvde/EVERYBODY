import React, { useState } from 'react';
import { Search, ArrowLeft, Bell } from 'lucide-react';

export default function AlertsSummaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const alerts = [
    { id: 1, name: 'Jane Doe', type: 'Sex Alert!' },
    { id: 2, name: 'Jane Doe', type: 'Drug Alert!' },
    { id: 3, name: 'Jane Doe', type: 'Gang Alert!' },
    { id: 4, name: 'Jane Doe', type: 'Gang Alert!' },
    { id: 5, name: 'Jane Doe', type: 'Gang Alert!' },
    { id: 6, name: 'Jane Doe', type: 'Gang Alert!' },
  ];

  const filteredAlerts = alerts.filter(alert =>
    alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center">
          <button className="mr-4 p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-normal">Summary</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search alerts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-4">
        <h2 className="text-xl font-normal mb-4">Alerts</h2>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-2xl p-4 flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-2xl mr-4 flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-base">{alert.name}</div>
                <div className="text-base text-gray-700 mt-0.5">{alert.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500">
          No alerts found
        </div>
      )}
    </div>
  );
}