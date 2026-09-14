import React from 'react';
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import { isSafeUrl } from '../utils/url';
import { usePortfolioContext } from '../context/PortfolioContext';
import '../styles/About.css';

const About = () => {
  const { profile, education } = usePortfolioContext();

  useEffect(() => {
    trackSectionView('home');
  }, []);

  const socials = profile?.socials || {};
  const rawPhoto = profile?.photo_url;
  const photoSrc = rawPhoto && isSafeUrl(rawPhoto) ? rawPhoto : asset('assets/profile.png');
  const firstEdu = education?.[0];

  const safeCredential = profile?.credential_url && isSafeUrl(profile.credential_url) ? profile.credential_url : '';
  // Resume sekarang via proxy /api/resume agar tidak bocor project ref supabase
  const hasResume = Boolean(profile?.resume_url);

  return (
    <section id="home" className="about">
      <div className="profile-section">
        <div className="profile-image">
          <img src={photoSrc} alt="Profile" referrerPolicy="no-referrer" />
        </div>
        <div className="social-links">
          {socials.linkedin && isSafeUrl(socials.linkedin) && (
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src={asset('assets/linkedin.svg')} alt="LinkedIn" />
            </a>
          )}
          {socials.instagram && isSafeUrl(socials.instagram) && (
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={asset('assets/instagram.svg')} alt="Instagram" />
            </a>
          )}
          {socials.github && isSafeUrl(socials.github) && (
            <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <img src={asset('assets/github.svg')} alt="GitHub" />
            </a>
          )}
        </div>
        {hasResume && (
          <a className="link-credensial" href="/api/resume" target="_blank" rel="noopener noreferrer" style={{ marginTop: 16 }}>
            Download Resume&#8599;
          </a>
        )}
      </div>
      <div className="about-content">
        <h1>{profile?.full_name}</h1>
        <h2>{profile?.tagline}</h2>
        <p>{profile?.bio}</p>
        <div className="about-bottom">
          <div className="education">
            <h3>EDUCATION</h3>
            {firstEdu ? (
              <>
                <h4>{firstEdu.major}</h4>
                <p>{firstEdu.school}<br />{firstEdu.start_year} - {firstEdu.end_year}</p>
                {education.length > 1 && (
                  <div style={{ marginTop: 16 }}>
                    {education.slice(1).map((edu) => (
                      <div key={edu.id} style={{ marginTop: 12 }}>
                        <h4>{edu.major}</h4>
                        <p>{edu.school}<br />{edu.start_year} - {edu.end_year}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h4>Computer Science/Informatics Engineering</h4>
                <p>Garut Institute of Technology<br />2021 - 2025</p>
              </>
            )}
          </div>
          <div className="interests">
            <h3>LICENCE & CREDENTIAL</h3> 
            <p>
            {safeCredential ? (
              <a className="link-credensial" href={safeCredential} target="_blank" rel="noopener noreferrer">
                Visit Link&#8599;
              </a >
            ) : (
              <span>-</span>
            )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
