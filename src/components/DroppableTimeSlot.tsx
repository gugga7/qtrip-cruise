import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from '../types/activity';
import { tc } from '../config/themeClasses';

interface DroppableTimeSlotProps {
  time: string;
  activity?: Activity;
  onDrop: (activity: Activity) => void;
  onActivityClick?: (activity: Activity) => void;
  isOver?: boolean;
  canDrop?: boolean;
}

export function DroppableTimeSlot({
  time,
  activity,
  onDrop,
  onActivityClick,
  isOver,
  canDrop,
}: DroppableTimeSlotProps) {
  const [isTouching, setIsTouching] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsTouching(true);
    const timeout = setTimeout(() => {
      if (activity) {
        onActivityClick?.(activity);
      }
    }, 500); // Long press duration
    setTouchTimeout(timeout);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    if (touchTimeout) {
      clearTimeout(touchTimeout);
    }
  };

  const handleTouchMove = () => {
    setIsTouching(false);
    if (touchTimeout) {
      clearTimeout(touchTimeout);
    }
  };

  return (
    <motion.div
      className={`relative p-2 sm:p-4 rounded-lg transition-all ${activity
          ? `${tc.bgPrimaryLight} ${tc.hoverBgPrimarySubtle}`
          : isOver && canDrop
            ? 'bg-green-50'
            : 'bg-gray-50 hover:bg-gray-100'
        } ${isTouching ? 'scale-95' : ''}`}
      animate={{ scale: isTouching ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={() => activity && onActivityClick?.(activity)}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 sm:w-20 flex-shrink-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{time}</p>
        </div>
        {activity ? (
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              <h4 className="font-medium text-sm sm:text-base truncate">{activity.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{activity.description}</p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>{activity.duration} mins</span>
                <span>•</span>
                <span>€{activity.price.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 min-h-[80px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-500">Drop activity here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}