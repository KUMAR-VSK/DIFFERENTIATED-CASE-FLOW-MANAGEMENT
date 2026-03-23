import React, { useEffect, useState } from 'react';
import Card from '../ui/core/Card.jsx';

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
        <Card title="Total Cases"><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalCases}</div></Card>
        <Card title="Filed"><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.filedCases}</div></Card>
        <Card title="Scheduled"><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.scheduledCases}</div></Card>
        <Card title="Completed"><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.completedCases}</div></Card>
        <Card title="Avg Priority"><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.averagePriority?.toFixed?.(1) ?? stats.averagePriority}</div></Card>
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
