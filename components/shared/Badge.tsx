
import React from 'react';
import Icon, { IconName } from '../Icon';

interface BadgeProps {
  label: string;
  icon: IconName;
  color: 'amber' | 'cyan' | 'green' | 'blue';
}

const colorClasses = {
    amber: 'bg-amber-100 text-amber-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
}

const Badge: React.FC<BadgeProps> = ({ label, icon, color }) => {
  return (
    <div className={`inline-flex items-center gap-x-2 py-1.5 px-3 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </div>
  );
};

export default Badge;
