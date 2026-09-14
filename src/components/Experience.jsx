import React from "react";
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { usePortfolioContext } from '../context/PortfolioContext';
import "../styles/Experience.css";

const Experience = () => {
  const { experiences } = usePortfolioContext();

  useEffect(() => {
    trackSectionView('experience');
  }, []);

  const works = (experiences || []).filter((e) => e.type === 'works');
  const professional = (experiences || []).filter((e) => e.type !== 'works');

  const renderItem = (item) => (
    <div key={item.id} className="experience-item">
      <h5>{item.title}</h5>
      <h4>{item.company}</h4>
      <span className="date">{item.date_text}</span>
      <ul>
        {(item.bullets || []).map((b, i) => (
          <li key={i}>{b}</li>
        ))}
        {item.link_url && (
          <li>
            <a className="link-web" href={item.link_url} target="blank" rel="noopener noreferrer">Visit Site&#8599;</a>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <section id="experience" className="experience">
      <h2>EXPERIENCE</h2>

      <div className="experience-columns">
        <div className="column works-column">
          <h3 className="section-title">WORKS</h3>
          {works.length ? works.map(renderItem) : <p style={{ color: 'var(--text-secondary)' }}>-</p>}
        </div>

        <div className="column professional-column">
          <h3 className="section-title">PROFESSIONAL</h3>
          {professional.length ? professional.map(renderItem) : <p style={{ color: 'var(--text-secondary)' }}>-</p>}
        </div>
      </div>
    </section>
  );
};

export default Experience;
