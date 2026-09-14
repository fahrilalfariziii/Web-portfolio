import React, { useState, useEffect } from "react";
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import { usePortfolioContext } from '../context/PortfolioContext';
import "../styles/Projects.css";

const Projects = () => {
  const { projects } = usePortfolioContext();
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    trackSectionView('projects');
  }, []);

  // Reset showAll when filter changes
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  // Combine JSON objects and convert to array
  const allProjects = (projects || []).filter((p) => p.is_visible !== false);
  const normalized = allProjects.map((p) => ({
    ...p,
    categories: p.category || p.categories,
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    year: p.year_text || p.year,
    webURL: p.web_url || p.webURL,
    repoUrl: p.repo_url || p.repoUrl,
  }));
  const projectsList = normalized;

  // Filter projects based on selected category
  const filteredProjects = filter === "all" 
    ? projectsList 
    : projectsList.filter(project => project.categories === filter);

  // Determine which projects to display
  const shouldShowMoreButton = filteredProjects.length > 3;
  const displayedProjects = shouldShowMoreButton && !showAll 
    ? filteredProjects.slice(0, 3)
    : filteredProjects;

  return (
    <section id="projects" className="projects">
      <h2>PROJECTS</h2>
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === "ML" ? "active" : ""}`}
          onClick={() => setFilter("ML")}
        >
          ML
        </button>
        <button 
          className={`filter-btn ${filter === "Web" ? "active" : ""}`}
          onClick={() => setFilter("Web")}
        >
          Web
        </button>
        <button 
          className={`filter-btn ${filter === "CV" ? "active" : ""}`}
          onClick={() => setFilter("CV")}
        >
          CV
        </button>
        <button 
          className={`filter-btn ${filter === "NLP" ? "active" : ""}`}
          onClick={() => setFilter("NLP")}
        >
          NLP
        </button>
        <button 
          className={`filter-btn ${filter === "n8n" ? "active" : ""}`}
          onClick={() => setFilter("n8n")}
        >
          n8n
        </button>
      </div>
      <div className="projects-grid">
        {displayedProjects.map((project, index) => (
          <div key={index} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-tech">
              {project.technologies.map((tech, techIndex) => (
                <span key={techIndex} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-footer">
              <span>{project.year}</span>
              <div className="project-links">
                {project.webURL && (
                  <a
                    href={project.webURL}
                    className="repo-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>View Site</span>
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    className="repo-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={asset('assets/github_icon_2.svg')} alt="GitHub" />
                    <span>Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {shouldShowMoreButton && !showAll && (
        <div className="show-more-container">
          {filter === "all" ? (
            <a
              href="https://github.com/fahrilalfariziii"
              className="show-more-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Show More
            </a>
          ) : (
            <button 
              className="show-more-btn"
              onClick={() => setShowAll(true)}
            >
              Show More
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default Projects;
