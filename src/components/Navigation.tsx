import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useFeature } from '../hooks/useNiche';
import { tc } from '../config/themeClasses';

interface Step {
  id: number;
  title: string;
  path: string;
}

interface NavigationProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function Navigation({ steps, currentStep, onStepChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const profileEnabled = useFeature('profilePage');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Helper function to determine if a step should be colored
  const getStepState = (index: number) => {
    const stepNumber = index + 1;
    return {
      isCompleted: stepNumber < currentStep,
      isNext: stepNumber === currentStep,
      lineColor: stepNumber < currentStep
        ? 'bg-green-500'  // Line after completed step
        : stepNumber === currentStep
          ? tc.bgPrimaryDark  // Line after current step
          : 'bg-gray-200'  // Line after future step
    };
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="max-w-7xl mx-auto">
          {/* Steps Progress */}
          <div className="hidden md:block">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                  const { isCompleted, isNext, lineColor } = getStepState(index);

                  return (
                    <div key={step.title} className="relative flex items-center flex-1">
                      <button
                        onClick={() => onStepChange(step.id)}
                        className="flex items-center z-10 bg-white"
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${isNext
                            ? `${tc.borderPrimaryDark} ${tc.bgPrimaryDark} text-white`
                            : isCompleted
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                            }`}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{step.id}</span>
                          )}
                        </div>
                        <span
                          className={`ml-2 text-sm font-medium whitespace-nowrap transition-colors ${isNext
                            ? tc.textPrimary
                            : isCompleted
                              ? 'text-green-500'
                              : 'text-gray-500'
                            }`}
                        >
                          {step.title}
                        </span>
                      </button>

                      {/* Progress Line Segment */}
                      {index < steps.length - 1 && (
                        <div className="flex-1 mx-4">
                          <div className={`h-0.5 transition-colors ${lineColor}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Language switcher + Profile */}
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <LanguageSwitcher />
                  {profileEnabled && (
                    <Link
                      to="/profile"
                      aria-label="Profile"
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tc.bgPrimaryMuted} ${tc.textPrimary} transition-colors ${tc.hoverBgPrimarySubtle}`}
                    >
                      <User size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden px-4 py-4 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className={`p-2 rounded-lg text-gray-600 ${tc.hoverTextPrimary} ${tc.hoverBgPrimaryLight} transition-colors`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep}: {steps[currentStep - 1]?.title || 'Start Planning'}
            </span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {profileEnabled && (
                <Link
                  to="/profile"
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${tc.bgPrimaryMuted} ${tc.textPrimary} transition-colors ${tc.hoverBgPrimarySubtle}`}
                >
                  <User size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Steps Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t"
            >
              <div className="px-4 py-3">
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const { isCompleted, isNext } = getStepState(index);
                    return (
                      <button
                        key={step.title}
                        onClick={() => {
                          onStepChange(step.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-center px-3 py-2 rounded-lg w-full ${isNext
                          ? `${tc.bgPrimaryLight} ${tc.textPrimary}`
                          : isCompleted
                            ? 'text-green-500'
                            : 'text-gray-500'
                          }`}
                      >
                        <div
                          className={`flex items-center justify-center w-6 h-6 rounded-full border ${isNext
                            ? `${tc.borderPrimaryDark} ${tc.bgPrimaryDark} text-white`
                            : isCompleted
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300'
                            }`}
                        >
                          {isCompleted ? (
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="text-xs">{step.id}</span>
                          )}
                        </div>
                        <span className="ml-3 text-sm font-medium">{step.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer to prevent content from being hidden under the fixed navigation */}
      <div className="h-[72px]" />
    </>
  );
}