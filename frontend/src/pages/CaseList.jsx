import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Card from '../ui/core/Card.jsx';

const CaseList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', caseType: '', courtLevel: '', query: '' });

  // simple column definitions
  const columns = [
    { key: 'caseNumber', label: 'Case Number', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'caseType', label: 'Case Type', sortable: true, render: (r) => r.caseType?.toString() },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <span className={`badge status-${r.status}`}>{r.status}</span> },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'filingDate', label: 'Filing Date', sortable: true, render: (r) => r.filingDate?.toString() },
    { key: 'hearingDate', label: 'Hearing Date', sortable: true, render: (r) => (r.hearingDate ?? '') + '' },
    { key: 'assignedJudge', label: 'Assigned Judge', sortable: false, render: (r) => r.assignedJudge?.firstName ?? '' },
    { key: 'view', label: 'Actions', sortable: false, render: (r) => <Link to={`/cases/${r.id}`}>View</Link> }
  ];

  // Build query params from filters
  const queryParams = () => {
    const parts = [];
    if (filters.status) parts.push(`status=${encodeURIComponent(filters.status)}`);
    if (filters.caseType) parts.push(`caseType=${encodeURIComponent(filters.caseType)}`);
    if (filters.courtLevel) parts.push(`courtLevel=${encodeURIComponent(filters.courtLevel)}`);
    if (filters.query) parts.push(`query=${encodeURIComponent(filters.query)}`);
    return parts.length ? '&' + parts.join('&') : '';
  };

  useEffect(() => {
    setLoading(true);
    // Fetch paginated management view with filters
    fetch(`/api/cases/management?page=${page}&size=${pageSize}&sortBy=filingDate&direction=desc${queryParams()}`)
      .then((res) => res.json())
      .then((data) => {
        // Spring Page usually has content, totalElements
        const content = data?.content ?? data ?? [];
        setData(content.map((c) => ({
          id: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
          caseType: c.caseType,
          status: c.status,
          priority: c.priority,
          filingDate: c.filingDate,
          hearingDate: c.hearingDate,
          assignedJudge: c.assignedJudge
        })));
        setTotal(data?.totalElements ?? data?.total ?? content.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, pageSize, filters]);

  const resetFilters = () => {
    setFilters({ status: '', caseType: '', courtLevel: '', query: '' });
    setPage(0);
  };

  if (loading) return <div>Loading cases...</div>;

  return (
    <div className="case-list" style={{ padding: '1rem' }}>
      <Card title="Case Management">
        <div className="filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            aria-label="Filter by status"
            className="btn"
          >
            <option value="">All Statuses</option>
            <option value="FILED">FILED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
          <select
            value={filters.caseType}
            onChange={(e) => setFilters((f) => ({ ...f, caseType: e.target.value }))}
            aria-label="Filter by case type"
            className="btn"
          >
            <option value="">All Types</option>
            <option value="CIVIL">Civil</option>
            <option value="CRIMINAL">Criminal</option>
            <option value="FAMILY">Family</option>
            <option value="CONSTITUTIONAL">Constitutional</option>
            <option value="ADMINISTRATIVE">Administrative</option>
          </select>
          <select
            value={filters.courtLevel}
            onChange={(e) => setFilters((f) => ({ ...f, courtLevel: e.target.value }))}
            aria-label="Filter by court level"
            className="btn"
          >
            <option value="">All Levels</option>
            <option value="DISTRICT">DISTRICT</option>
            <option value="HIGH">HIGH</option>
            <option value="SUPREME">SUPREME</option>
          </select>
          <input
            type="text"
            placeholder="Search title or case number"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            className="btn"
          />
          <button onClick={resetFilters} className="btn">
            Reset
          </button>
        </div>
        <DataTable
          columns={columns}
          data={data}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
};

export default CaseList;
