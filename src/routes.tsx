import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { FullPageSpinner } from './components/Spinner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Eager-loaded: wizard step pages + MainLayout (critical path)
import { Preferences } from './pages/Preferences';
import { Activities } from './pages/Activities';
import { Transport } from './pages/Transport';
import { Accommodation } from './pages/Accommodation';
import { Schedule } from './pages/Schedule';
import { ReviewBook } from './pages/ReviewBook';
import { MainLayout } from './components/MainLayout';

// Lazy-loaded: standalone pages
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const JoinGroup = React.lazy(() => import('./pages/JoinGroup').then(m => ({ default: m.JoinGroup })));
const BookingDetail = React.lazy(() => import('./pages/BookingDetail').then(m => ({ default: m.BookingDetail })));
const Routes = React.lazy(() => import('./pages/Routes').then(m => ({ default: m.Routes })));

// Lazy-loaded: admin pages
const Dashboard = React.lazy(() => import('./admin/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Cities = React.lazy(() => import('./admin/pages/Cities').then(m => ({ default: m.Cities })));
const Products = React.lazy(() => import('./admin/pages/Products').then(m => ({ default: m.Products })));
const AIConfig = React.lazy(() => import('./admin/pages/AIConfig').then(m => ({ default: m.AIConfig })));
const QuoteReview = React.lazy(() => import('./admin/pages/QuoteReview').then(m => ({ default: m.QuoteReview })));
const AdminLayout = React.lazy(() => import('./admin/components/AdminLayout').then(m => ({ default: m.AdminLayout })));

// Suspense wrapper for lazy-loaded routes
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>;
}

export const routes = [
  {
    path: '/routes',
    element: <Lazy><Routes /></Lazy>,
    label: 'All Routes'
  },
  {
    path: '/home',
    element: <Lazy><Home /></Lazy>,
    label: 'Home'
  },
  {
    path: '/login',
    element: <Lazy><Login /></Lazy>,
    label: 'Login'
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Lazy><Profile /></Lazy></ProtectedRoute>,
    label: 'Profile'
  },
  {
    path: '/join/:code',
    element: <Lazy><JoinGroup /></Lazy>,
    label: 'Join Group'
  },
  {
    path: '/booking',
    element: <ProtectedRoute><Lazy><BookingDetail /></Lazy></ProtectedRoute>,
    label: 'Booking Detail'
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'preferences',
        element: (() => {
          const PreferencesStep = () => {
            const navigate = useNavigate();
            return <Preferences onNext={() => navigate('/activities')} onBack={() => navigate('/home')} />;
          };
          return <PreferencesStep />;
        })(),
        label: 'Preferences'
      },
      {
        path: 'activities',
        element: (() => {
          const ActivitiesStep = () => {
            const navigate = useNavigate();
            return <Activities onNext={() => navigate('/transport')} onBack={() => navigate('/preferences')} />;
          };
          return <ActivitiesStep />;
        })(),
        label: 'Activities'
      },
      {
        path: 'transport',
        element: (() => {
          const TransportStep = () => {
            const navigate = useNavigate();
            return <Transport onNext={() => navigate('/accommodation')} onBack={() => navigate('/activities')} />;
          };
          return <TransportStep />;
        })(),
        label: 'Transport'
      },
      {
        path: 'accommodation',
        element: (() => {
          const AccommodationStep = () => {
            const navigate = useNavigate();
            return <Accommodation onNext={() => navigate('/schedule')} onBack={() => navigate('/transport')} />;
          };
          return <AccommodationStep />;
        })(),
        label: 'Accommodation'
      },
      {
        path: 'schedule',
        element: (() => {
          const ScheduleStep = () => {
            const navigate = useNavigate();
            return <Schedule onNext={() => navigate('/review')} onBack={() => navigate('/accommodation')} />;
          };
          return <ScheduleStep />;
        })(),
        label: 'Schedule'
      },
      {
        path: 'review',
        element: (() => {
          const ReviewStep = () => {
            const navigate = useNavigate();
            return <ReviewBook onNext={() => navigate('/')} onBack={() => navigate('/schedule')} />;
          };
          return <ReviewStep />;
        })(),
        label: 'Review & Quote'
      }
    ]
  }
];

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminRoute><Lazy><AdminLayout /></Lazy></AdminRoute>,
    children: [
      {
        path: '',
        element: <Lazy><Dashboard /></Lazy>,
        label: 'Dashboard'
      },
      {
        path: 'cities',
        element: <Lazy><Cities /></Lazy>,
        label: 'Cities'
      },
      {
        path: 'products',
        element: <Lazy><Products /></Lazy>,
        label: 'Products'
      },
      {
        path: 'ai-config',
        element: <Lazy><AIConfig /></Lazy>,
        label: 'AI Config'
      },
      {
        path: 'quotes',
        element: <Lazy><QuoteReview /></Lazy>,
        label: 'Quote Review'
      }
    ]
  }
];

export const router = createBrowserRouter([...routes, ...adminRoutes]);
