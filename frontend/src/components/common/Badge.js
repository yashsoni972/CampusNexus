import React from 'react';
import { getStatusColor, getPriorityColor, getCategoryColor, getRoleColor } from '../../utils/helpers';

const Badge = ({ type = 'default', value, className = '' }) => {
  let colorClass = '';

  switch (type) {
    case 'status': colorClass = getStatusColor(value); break;
    case 'priority': colorClass = getPriorityColor(value); break;
    case 'category': colorClass = getCategoryColor(value); break;
    case 'role': colorClass = getRoleColor(value); break;
    default: colorClass = 'bg-gray-100 text-gray-700';
  }

  const label = value?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  return (
    <span className={`badge ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
