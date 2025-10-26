import React, { useState, useEffect } from "react";
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import projectsData from '../data/projects.json';
import "../styles/Projects.css";

const Projects = () => {
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    trackSectionView('projects');
  }, []);

  // Reset showAll when filter changes
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  // Convert JSON object to array
  const projects = Object.values(projectsData);

  // Filter projects based on selected category
  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(project => project.categories === filter);

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
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(true)}
          >
            Show More
          </button>
        </div>
      )}
    </section>
  );
};

export default Projects;
