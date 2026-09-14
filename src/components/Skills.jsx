import React from 'react';
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
          <div key={skill.id ?? skill.name} className="skill-item" tabIndex={0}>
            <div className="skill-inner">
              {skill.logo_url ? <img src={skill.logo_url} alt={skill.name} /> : <span>{skill.name}</span>}

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
        ))}
      </div>
    </section>
  );
};

export default Skills;