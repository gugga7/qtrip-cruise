import { Activity } from '../lib/types';

interface OptimizationScenario {
  name: string;
  description: string;
  getOptimization: (activities: Activity[]) => ScheduleOptimization;
}

interface ScheduleOptimization {
  moves: {
    activityId: number;
    fromSlot: { day: number; slot: string } | null;
    toSlot: { day: number; slot: string };
    reason: string;
  }[];
  suggestions: {
    warnings: { message: string }[];
    optimizations: { type: string; description: string }[];
  };
}

const createMockOptimization = (activities: Activity[]): ScheduleOptimization => ({
  moves: activities.map((activity, index) => ({
    activityId: activity.id,
    fromSlot: null,
    toSlot: {
      day: Math.floor(index / 3) + 1,
      slot: ['Morning', 'Afternoon', 'Evening'][index % 3]
    },
    reason: `Optimally placed ${activity.title} based on time and energy level`
  })),
  suggestions: {
    warnings: [
      { message: 'Some activities might be too close together' },
      { message: 'Consider weather conditions for outdoor activities' }
    ],
    optimizations: [
      { type: 'energy', description: 'Try to space out high-energy activities' },
      { type: 'breaks', description: 'Consider adding breaks between major attractions' }
    ]
  }
});

export const optimizationScenarios: OptimizationScenario[] = [
  {
    name: 'energyBased',
    description: 'Optimizes schedule based on energy levels throughout the day',
    getOptimization: (activities) => createMockOptimization(activities)
  },
  {
    name: 'relaxedExplorer',
    description: 'Creates a relaxed schedule with plenty of breaks',
    getOptimization: (activities) => ({
      moves: activities.map((activity, index) => ({
        activityId: activity.id,
        fromSlot: null,
        toSlot: {
          day: Math.floor(index / 2) + 1,
          slot: ['Morning', 'Afternoon'][index % 2]
        },
        reason: `Placed ${activity.title} with ample time for breaks and relaxation`
      })),
      suggestions: {
        warnings: [
          { message: 'Some days might feel light on activities' }
        ],
        optimizations: [
          { type: 'breaks', description: 'Consider optional activities for free time slots' },
          { type: 'flexibility', description: 'Use extra time to explore local areas casually' }
        ]
      }
    })
  },
  {
    name: 'weatherOptimized',
    description: 'Optimizes schedule based on typical weather patterns',
    getOptimization: (activities) => ({
      moves: activities.map((activity, index) => ({
        activityId: activity.id,
        fromSlot: null,
        toSlot: {
          day: Math.floor(index / 3) + 1,
          slot: activity.category === 'outdoor' ? 'Morning' : ['Afternoon', 'Evening'][index % 2]
        },
        reason: `Scheduled ${activity.title} during optimal weather conditions`
      })),
      suggestions: {
        warnings: [
          { message: 'Check weather forecast for outdoor activities' }
        ],
        optimizations: [
          { type: 'weather', description: 'Have indoor backup plans for outdoor activities' },
          { type: 'seasonal', description: 'Consider seasonal weather patterns' }
        ]
      }
    })
  }
];

export type { ScheduleOptimization, OptimizationScenario }; 