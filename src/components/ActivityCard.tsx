import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Star, Image, Plus, X, Check } from 'lucide-react';
import type { Activity } from '../lib/types';
import { tc } from '../config/themeClasses';

interface ActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  onSelect: (activity: Activity) => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
  onQuickRemove?: (e: React.MouseEvent) => void;
}

export function ActivityCard({ 
  activity, 
  isSelected, 
  onSelect, 
  onQuickAdd, 
  onQuickRemove 
}: ActivityCardProps) {
  const { t } = useTranslation();
  const imageUrl = activity.mainImage?.url ||
                  (activity.imageGallery && activity.imageGallery.length > 0 
                    ? activity.imageGallery[0].url 
                    : null);

  return (
    <div 
      onClick={() => onSelect(activity)}
      className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer overflow-hidden relative"
    >
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Quick action buttons */}
        {isSelected ? (
          <>
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <Check size={16} />
            </div>
            <button
              onClick={onQuickRemove}
              className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onQuickAdd}
            className={`absolute top-2 right-2 ${tc.bgPrimary} text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium">{activity.title}</h3>
        <p className="text-sm text-gray-600">{activity.duration} {t('common.minutes')}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium">€{activity.price}</span>
          <span className="text-sm text-gray-500">{activity.category}</span>
        </div>
      </div>
    </div>
  );
}