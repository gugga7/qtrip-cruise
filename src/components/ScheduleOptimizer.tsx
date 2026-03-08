import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ActivityAnalysis from './ActivityAnalysis';
import EnergyDistribution from './EnergyDistribution';
import WeatherOptimization from './WeatherOptimization';
import ScheduleOptimization from './ScheduleOptimization';

interface ScheduleOptimizerProps {
  activities: Activity[];
  onScheduleComplete: () => void;
}

export function ScheduleOptimizer({
  activities,
  onScheduleComplete
}: ScheduleOptimizerProps) {
  const [optimizationStep, setOptimizationStep] = useState(0);
  const steps = [
    'Analyzing activities',
    'Calculating energy distribution',
    'Checking weather conditions',
    'Optimizing schedule',
    'Finalizing arrangements'
  ];

  return (
    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <motion.div
        className="bg-white rounded-xl p-8 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-semibold mb-6">Optimizing Your Schedule</h2>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: 0,
                opacity: index <= optimizationStep ? 1 : 0.5
              }}
            >
              <motion.div
                className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${index < optimizationStep ? 'bg-green-500' :
                    index === optimizationStep ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                {index < optimizationStep ? '✓' : '•'}
              </motion.div>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>

        {/* Optimization Visualizations */}
        <div className="mt-6">
          {optimizationStep === 0 && <ActivityAnalysis activities={activities} />}
          {optimizationStep === 1 && <EnergyDistribution />}
          {optimizationStep === 2 && <WeatherOptimization />}
          {optimizationStep === 3 && <ScheduleOptimization />}
        </div>
      </motion.div>
    </motion.div>
  );
} 