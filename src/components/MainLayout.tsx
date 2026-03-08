import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { MobileTripPill } from './MobileTripPill';
import { TripSummary } from './TripSummary';
import { GroupDashboard } from './GroupDashboard';

const steps = [
  { id: 1, title: 'Preferences', path: 'preferences' },
  { id: 2, title: 'Activities', path: 'activities' },
  { id: 3, title: 'Transport', path: 'transport' },
  { id: 4, title: 'Accommodation', path: 'accommodation' },
  { id: 5, title: 'Schedule', path: 'schedule' },
  { id: 6, title: 'Review & Quote', path: 'review' },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split('/')[1] || 'preferences';
  const currentStep = steps.findIndex((step) => step.path === currentPath) + 1;
  const handleStepChange = (stepId: number) => {
    const step = steps.find((item) => item.id === stepId);
    if (step) navigate(`/${step.path}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navigation steps={steps} currentStep={currentStep} onStepChange={handleStepChange} />
      <div className="flex flex-1 overflow-hidden">
        <main id="main-content" className="flex-1 overflow-y-auto">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
        <aside className="hidden w-[380px] border-l border-slate-200 bg-white/85 p-6 backdrop-blur xl:block"><div className="sticky top-24 space-y-4"><TripSummary /><GroupDashboard /></div></aside>
        <MobileTripPill />
      </div>
    </div>
  );
}