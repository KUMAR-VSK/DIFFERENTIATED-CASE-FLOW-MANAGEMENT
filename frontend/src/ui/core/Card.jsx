import React from 'react';

const Card = ({ title, children }) => (
  <section className="ui-card" aria-label={title} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', background: 'var(--surface)' }}>
    {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
    <div>{children}</div>
  </section>
);

export default Card;
