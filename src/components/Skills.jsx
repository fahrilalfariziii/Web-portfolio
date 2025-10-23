import React from 'react';
import '../styles/Skills.css';

const Skills = () => {
  const skills = [
    { name: 'Python', logo: '/src/assets/python_logo.svg', level: 90 },
    { name: 'TensorFlow', logo: '/src/assets/tensorflow_logo.svg', level: 88 },
    { name: 'PyTorch', logo: '/src/assets/pytorch_logo.svg', level: 75 },
    { name: 'HTML', logo: '/src/assets/html_logo.svg', level: 70 },
    { name: 'CSS', logo: '/src/assets/css_logo.svg', level: 88 },
    { name: 'JavaScript', logo: '/src/assets/js_logo.svg', level: 82 },
    { name: 'PHP', logo: '/src/assets/php_logo.svg', level: 60 },
    { name: 'MySQL', logo: '/src/assets/mysql_logo.svg', level: 72 },
    { name: 'Git', logo: '/src/assets/git_logo.svg', level: 80 },
  ];

  return (
    <section id="skills" className="skills">
      <h2>SKILLS</h2>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item" tabIndex={0}>
            <div className="skill-inner">
              <img src={skill.logo} alt={skill.name} />

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