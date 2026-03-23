import React from 'react';

const Badge = ({ status, children }) => {
  const color = {
    FILED: '#d1d5db',
    UNDER_REVIEW: '#bfdbfe',
    SCHEDULED: '#fde68a',
    ESCALATED: '#fecaca',
    COMPLETED: '#d1fae5',
    DISMISSED: '#fbcfe8'
  }[status] || '#e5e7eb';

  return (
    <span style={{ padding: '0.15em 0.5em', borderRadius: 4, background: color, fontSize: '0.85em' }}>
      {children ?? status}
    </span>
  );
};

export default Badge;
