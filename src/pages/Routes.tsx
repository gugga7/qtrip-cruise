import React from 'react';
import { Link } from 'react-router-dom';

// Define the route types without the router elements
const mainRoutes = [
  {
    path: '/routes',
    label: 'All Routes'
  },
  {
    path: '/',
    label: 'Home'
  },
  {
    path: '/login',
    label: 'Login'
  },
  {
    path: '/profile',
    label: 'Profile'
  },
  {
    path: '/activities',
    label: 'Activities'
  },
  {
    path: '/transport',
    label: 'Transport'
  },
  {
    path: '/accommodation',
    label: 'Accommodation'
  },
  {
    path: '/schedule',
    label: 'Schedule'
  },
  {
    path: '/preferences',
    label: 'Preferences'
  },
  {
    path: '/review',
    label: 'Review & Quote'
  }
];

const adminRoutes = [
  {
    path: '',
    label: 'Dashboard'
  },
  {
    path: 'cities',
    label: 'Cities'
  },
  {
    path: 'products',
    label: 'Products'
  },
  {
    path: 'ai-config',
    label: 'AI Configuration'
  }
];

export const Routes: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">QTRIP Navigation Hub</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Main Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <span className="font-medium text-blue-600">{route.label}</span>
              <span className="text-gray-500 text-sm block mt-1">{route.path}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Admin Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminRoutes.map((route) => (
            <Link
              key={route.path}
              to={`/admin/${route.path}`}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <span className="font-medium text-purple-600">{route.label}</span>
              <span className="text-gray-500 text-sm block mt-1">/admin/{route.path}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Navigation Instructions</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Click on any card to navigate to that page</li>
          <li>Main routes are accessible to all users</li>
          <li>Admin routes require authentication</li>
          <li>Use the browser's back button to return to this page</li>
        </ul>
      </div>
    </div>
  );
}; 