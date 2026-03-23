import React, { useEffect, useState } from 'react';

const Card = ({ title, value, subtitle }) => (
  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', minWidth: 180 }}>
    <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{title}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
    {subtitle && <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{subtitle}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [courtStats, setCourtStats] = useState(null);

  useEffect(() => {
    fetch('/api/cases/statistics')
      .then((r) => r.json())
      .then((s) => setStats(s));
    fetch('/api/cases/court-stats')
      .then((r) => r.json())
      .then((s) => setCourtStats(s));
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Card title="Total Cases" value={stats.totalCases} />
        <Card title="Filed" value={stats.filedCases} />
        <Card title="Scheduled" value={stats.scheduledCases} />
        <Card title="Completed" value={stats.completedCases} />
        <Card title="Avg Priority" value={stats.averagePriority?.toFixed?.(1) ?? stats.averagePriority} />
      </div>
      {courtStats && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Court Level Distribution</h3>
          <div>District: {courtStats.districtCourtCases}</div>
          <div>High Court: {courtStats.highCourtCases}</div>
          <div>Supreme Court: {courtStats.supremeCourtCases}</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
