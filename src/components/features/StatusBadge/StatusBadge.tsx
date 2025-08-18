import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = status === 'Received' ? 'bg-yellow-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500';
  return <span className={`px-2 py-1 rounded text-white ${color}`}>{status}</span>;
};

export default StatusBadge;