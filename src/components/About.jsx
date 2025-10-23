import React from 'react';
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import '../styles/About.css';

const About = () => {
  useEffect(() => {
    trackSectionView('home');
  }, []);

  return (
    <section id="home" className="about">
      <div className="profile-image">
        <img src={asset('assets/profile.png')} alt="Profile" />
      </div>
      <div className="about-content">
        <h1>Fahril Sidik Alfarizi</h1>
        <h2><a className="link-email" href="mailto:fahrilsidik207@gmail.com" target="_blank">fahrilsidik207@gmail.com</a> | West Java, Indonesia</h2>
        <p>
          I am a Machine Learning Engineer with a focus on Machine Learning and Deep Learning.
          I am a Computer Science/Information Engineering graduate from the Garut Institute of Technology
          and a graduate of Bangkit Academy 2024 Batch 1 (Machine Learning path). I have experience
          building deep learning models using TensorFlow, from data processing to implementation,
          and am interested in creating innovative data-driven solutions.
        </p>
        <div className="about-bottom">
          <div className="education">
            <h3>EDUCATION</h3>
            <h4>Computer Science/Informatics Engineering</h4>
            <p>Garut Institute of Technology<br />2021 - 2025</p>
          </div>
          <div className="interests">
            <h3>LICENCE & CREDENTIAL</h3> 
            <p>
            <a className="link-credensial" href="https://www.notion.so/Licence-Credential-Fahril-Sidik-Alfarizi-6db2fb315d884612aef994a956ece0c5?source=copy_link" target='blank'>
              Visit Link&#8599;
            </a >
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;