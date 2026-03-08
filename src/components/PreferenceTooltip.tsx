import { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PreferenceTooltip({ title, description }: { title: string; description: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Info size={16} />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-full ml-2 top-0 z-50 w-48 p-2 bg-white rounded-lg shadow-lg border text-xs"
          >
            <h4 className="font-medium mb-1">{title}</h4>
            <p className="text-gray-600">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 