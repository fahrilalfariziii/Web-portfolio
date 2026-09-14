import React, { useState } from 'react';
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { usePortfolioContext } from '../context/PortfolioContext';
import '../styles/Skills.css';

const Skills = () => {
  const { skills } = usePortfolioContext();

  useEffect(() => {
    trackSectionView('skills');
  }, []);

  return (
    <section id="skills" className="skills">
      <h2>SKILLS</h2>
      <div className="skills-grid">
        {(skills || []).map((skill) => (
          <SkillCard key={skill.id ?? skill.name} skill={skill} />
        ))}
      </div>
    </section>
  );
};

const SkillCard = ({ skill }) => {
  const [imgError, setImgError] = useState(false);
  const showImg = skill.logo_url && !imgError;
  return (
    <div className="skill-item" tabIndex={0}>
      <div className="skill-inner">
        <div className="skill-logo">
          {showImg ? (
            <img
              src={skill.logo_url}
              alt={skill.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="skill-fallback">{skill.name?.slice(0, 2)?.toUpperCase()}</span>
          )}
        </div>

        <div className="skill-overlay" aria-hidden="true">
          <div className="skill-name">{skill.name}</div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={skill.level}
          >
            <div
              className="progress-fill"
              style={{ width: `${skill.level}%` }}
            />
          </div>
          <div className="percent">{skill.level}%</div>
        </div>
      </div>
    </div>
  );
};

export default Skills;