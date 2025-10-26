import React from 'react';
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import '../styles/Skills.css';

const Skills = () => {
  useEffect(() => {
    trackSectionView('skills');
  }, []);

  const skills = [
    { name: 'Python', logo: asset('assets/python_logo.svg'), level: 90 },
    { name: 'HTML', logo: asset('assets/html_logo.svg'), level: 70 },
    { name: 'CSS', logo: asset('assets/css_logo.svg'), level: 70 },
    { name: 'JavaScript', logo: asset('assets/js_logo.svg'), level: 80 },
    { name: 'React', logo: asset('assets/react.svg'), level: 78 },
    { name: 'PHP', logo: asset('assets/php_logo.svg'), level: 70 },
    { name: 'MySQL', logo: asset('assets/mysql_logo.svg'), level: 72 },
    { name: 'TensorFlow', logo: asset('assets/tensorflow_logo.svg'), level: 88 },
    { name: 'PyTorch', logo: asset('assets/pytorch_logo.svg'), level: 75 },
    { name: 'Hugging Face', logo: asset('assets/hf-logo.svg'), level: 70 },
    { name: 'OpenCV', logo: asset('assets/opencv.svg'), level: 70 },
    { name: 'NumPy', logo: asset('assets/numpy.svg'), level: 80 },
    { name: 'Git', logo: asset('assets/git_logo.svg'), level: 75 },
    { name: 'Docker', logo: asset('assets/docker.svg'), level: 65 },
    // { name: 'Kubernetes', logo: asset('assets/kubernetes_logo.svg'), level: 60 },
    { name: 'Google Cloud', logo: asset('assets/google-cloud.svg'), level: 65 },

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