import React, { useEffect, useMemo, useState } from 'react';

const HearingsCalendar = () => {
  const [hearings, setHearings] = useState([]);

  useEffect(() => {
    fetch('/api/cases/hearings')
      .then((r) => r.json())
      .then((data) => setHearings(data));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    hearings.forEach((h) => {
      const date = h.hearingDate ? h.hearingDate.substring(0, 10) : 'Unscheduled';
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(h);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [hearings]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Hearings Calendar</h2>
      <div>
        {grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: '1rem' }}>
            <h4>{date}</h4>
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  {it.title} – {it.hearingDate}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HearingsCalendar;
