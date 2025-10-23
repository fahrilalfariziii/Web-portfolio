import React from "react";
import { useEffect } from 'react';
import { trackSectionView } from '../utils/analytics';
import { asset } from '../utils/assetPath';
import "../styles/Projects.css";

const Projects = () => {
  useEffect(() => {
    trackSectionView('projects');
  }, []);

  const projects = [
    {
      title: "Implementation of Neural Collaborative Filtering ResNet and BERT for Coffee Shop Recommender System Model Based on Images and User Reviews",
      description: "This project is a thesis research that discusses the problem of selecting a coffee shop that is suitable for visitors.",
      technologies: ["Python", "TensorFlow", "BERT", "ResNet", "Neural CF", "NLP", "Pytorch"],
      year: "Fahril Sidik Alfarizi, 2025",
      repoUrl: "#",
    },
    {
      title: "RecycleMe - waste classification with MobileNetV2",
      description: "This capstone project classifies and detects waste with 5 waste categories",
      technologies: ["Python", "TensorFlow", "MobileNetV2", "Android Studio", "Firebase", "REST API"],
      year: "Team Capstone, 2024",
      repoUrl: "https://github.com/Juli-Yash/RecycleMe",
    },
  ];

  return (
    <section id="projects" className="projects">
      <h2>PROJECTS</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
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
              <a
                href={project.repoUrl}
                className="repo-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={asset('assets/github_icon_2.svg')} alt="GitHub" />
                <span>Repository</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
