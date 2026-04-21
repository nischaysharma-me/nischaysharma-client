'use client';

import React, { useEffect, useRef } from 'react';
import ActivityHeatmap, { ActivityDay } from '@/components/ui/ActivityHeatmap';

interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalContributions: number;
  followerCount: number;
}

interface Language {
  name: string;
  percentage: number;
  color?: string;
}

interface Position {
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string;
  logo?: string;
}

interface Education {
  startDate: string;
  endDate: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  logo?: string;
}

interface Project {
  title: string;
  description: string;
  link?: string;
  image?: string;
}

interface Profile {
  displayName?: string;
  bio?: string;
  vision?: string;
  occupation?: string;
  email?: string;
  skills?: string[];
  expertise?: string[];
  projects?: Project[];
  experience?: Position[];
  education?: Education[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  analytics?: {
    github?: {
      stats: GitHubStats;
      languages?: Language[];
      contributionCalendar?: ActivityDay[];
    };
  };
}

interface AboutClientProps {
  profile: Profile | null;
}

export default function AboutClient({ profile }: AboutClientProps) {
  const github = profile?.analytics?.github;
  
  const positions = profile?.experience || [];
  const education = profile?.education || [];
  const skills = profile?.skills || [];
  const expertise = profile?.expertise || [];
  const projects = profile?.projects || [];

  // Animation effect for career items
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const careerItems = document.querySelectorAll('.career-item');
    careerItems.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-wrapper">
      <main className="about-view">
        {/* --- Hero Section --- */}
        <section className="about-hero">
          <div className="about-hero__container">
            <div className="about-hero__header">
              <span className="about-hero__eyebrow">Digital Anthology & Portfolio</span>
              <h1 className="about-hero__title">
                {profile?.displayName || 'Nischay Sharma'}
              </h1>
              <p className="about-hero__occupation">{profile?.occupation || 'Software Architect'}</p>
            </div>
            
            <div className="about-hero__grid">
              <div className="about-hero__bio-col">
                <p className="about-hero__bio-text">
                  {profile?.bio || 'I am a lead developer specializing in building scalable backend systems, architecting cloud-native applications, and creating intuitive developer experiences.'}
                </p>
                
                {github && (
                  <div className="about-github-stats">
                    <div className="stat-item">
                      <span className="stat-num">{github.stats.totalRepos}</span>
                      <span className="stat-label">Repos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">{github.stats.totalStars}</span>
                      <span className="stat-label">Stars</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">{github.stats.totalContributions}</span>
                      <span className="stat-label">Commits</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="about-hero__stack-col">
                <div className="stack-container">
                  <h3 className="stack-title">Core Capability</h3>
                  <div className="stack-grid">
                    {expertise.slice(0, 6).map(item => (
                      <div key={item} className="stack-item">{item}</div>
                    ))}
                  </div>
                </div>
                
                <div className="contact-minimal">
                   <span className="contact-label">Inquiries</span>
                   <a href={`mailto:${profile?.email}`} className="contact-link">{profile?.email}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Activity Visualization --- */}
        {github?.contributionCalendar && (
          <section className="about-activity">
            <div className="about-activity__container">
              <ActivityHeatmap 
                data={github.contributionCalendar} 
                title="Productivity Index"
                limitDays={371}
              />
            </div>
          </section>
        )}

        {/* --- Vision Statement --- */}
        <section className="about-vision">
           <div className="about-vision__container">
              <div className="about-vision__content">
                <h2 className="section-label">The Vision</h2>
                <p className="vision-text">
                   {profile?.vision || 'TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn\'t just store data, but actively participates in value creation.'}
                </p>
              </div>
           </div>
        </section>

        {/* --- Featured Projects --- */}
        {projects.length > 0 && (
          <section className="about-projects">
            <div className="about-projects__container">
              <h2 className="section-title">Selected Works</h2>
              <div className="projects-wall">
                {projects.map((project, i) => (
                  <div key={i} className="project-node">
                    <div className="project-node__image-wrapper">
                       {project.image ? (
                         <img src={project.image} alt={project.title} className="project-node__img" />
                       ) : (
                         <div className="project-node__placeholder" />
                       )}
                       <div className="project-node__overlay">
                          <div className="project-node__content">
                             <h3 className="project-node__title">{project.title}</h3>
                             <p className="project-node__desc">{project.description}</p>
                             {project.link && (
                               <a href={project.link} target="_blank" className="project-node__link">
                                 EXPLORE <i className="ph ph-arrow-right" />
                               </a>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- Career Timeline (LinkedIn Style) --- */}
        {positions.length > 0 && (
          <section className="about-career">
            <div className="about-career__container">
              <h2 className="section-title">Professional Path</h2>
              <div className="career-timeline">
                {positions.map((pos, i) => (
                  <div key={i} className="career-item">
                    <div className="career-item__logo">
                       {pos.logo ? (
                         <img src={pos.logo} alt={pos.company} />
                       ) : (
                         <div className="logo-placeholder">{pos.company[0]}</div>
                       )}
                    </div>
                    <div className="career-item__body">
                      <div className="career-item__header">
                        <h3 className="career-item__title">{pos.title}</h3>
                        <span className="career-item__date">{pos.startDate} — {pos.endDate}</span>
                      </div>
                      <p className="career-item__company">{pos.company}</p>
                      <p className="career-item__description">{pos.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- Academic Path --- */}
        {education.length > 0 && (
          <section className="about-academic">
            <div className="about-academic__container">
              <h2 className="section-title">Academic Genesis</h2>
              <div className="academic-grid">
                {education.map((edu, i) => (
                  <div key={i} className="academic-card">
                    <div className="academic-card__logo">
                       {edu.logo ? <img src={edu.logo} alt={edu.school} /> : <div className="logo-placeholder">{edu.school[0]}</div>}
                    </div>
                    <div className="academic-card__content">
                       <h3 className="academic-card__school">{edu.school}</h3>
                       <p className="academic-card__degree">{edu.degree} in {edu.fieldOfStudy}</p>
                       <span className="academic-card__date">{edu.startDate} — {edu.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- Skills & Expertise Footer --- */}
        {skills.length > 0 && (
          <section className="about-skills">
            <div className="about-skills__container">
               <div className="skills-marquee">
                  <div className="skills-track">
                     {/* Double the skills for seamless loop if needed, for now just a cloud */}
                     {skills.map(skill => (
                       <span key={skill} className="skill-chip">{skill.toUpperCase()}</span>
                     ))}
                  </div>
               </div>
            </div>
          </section>
        )}

        <footer className="about-footer">
           <div className="about-footer__container">
              <div className="about-footer__left">
                <span className="copyright">© {new Date().getFullYear()} {profile?.displayName?.toUpperCase()}</span>
                <span className="tagline">Built for the next era of development.</span>
              </div>
              <div className="about-footer__right">
                {profile?.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank">GITHUB</a>}
                {profile?.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank">LINKEDIN</a>}
                {profile?.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank">TWITTER</a>}
              </div>
           </div>
        </footer>
      </main>

      <style jsx global>{`
        :root {
          --about-bg: #0a0a0a;
          --about-text: #ffffff;
          --about-muted: #a0a0a0;
          --about-border: #2a2a2a;
          --about-accent: #64ffda;
          --about-accent-dark: #4db6ac;
          --about-card-bg: #121212;
          --about-hover-bg: #1a1a1a;
        }

        .about-wrapper {
          background: var(--about-bg);
          color: var(--about-text);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .section-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: var(--about-muted);
          margin-bottom: 2rem;
          display: block;
          font-weight: 600;
        }

        .section-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 4rem;
          background: linear-gradient(to right, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* --- Hero --- */
        .about-hero {
          padding: 12rem 0 8rem;
        }
        .about-hero__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
        }
        .about-hero__header {
          margin-bottom: 6rem;
        }
        .about-hero__eyebrow {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: var(--about-accent);
          margin-bottom: 1.5rem;
          display: block;
          font-weight: 600;
        }
        .about-hero__title {
          font-size: clamp(3.5rem, 10vw, 8rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #ffffff, #a0a0a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .about-hero__occupation {
          font-size: 1.75rem;
          opacity: 0.6;
          font-weight: 300;
          letter-spacing: -0.02em;
        }
        .about-hero__grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 8rem;
          align-items: start;
        }
        .about-hero__bio-text {
          font-size: 1.8rem;
          line-height: 1.5;
          font-weight: 400;
          margin-bottom: 4rem;
          color: #e0e0e0;
          letter-spacing: -0.01em;
        }
        .about-github-stats {
          display: flex;
          gap: 4rem;
        }
        .stat-num {
          display: block;
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--about-accent);
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--about-muted);
          font-weight: 500;
        }

        .stack-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--about-muted);
          margin-bottom: 2rem;
          font-weight: 600;
        }
        .stack-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 4rem;
        }
        .stack-item {
          font-size: 1.1rem;
          font-weight: 600;
          padding: 1.25rem;
          border-bottom: 1px solid var(--about-border);
          transition: all 0.3s ease;
        }
        .stack-item:hover {
          border-bottom-color: var(--about-accent);
          padding-left: 1.5rem;
        }

        .contact-minimal {
          border-top: 1px solid var(--about-border);
          padding-top: 2rem;
        }
        .contact-label {
          display: block;
          font-size: 0.75rem;
          color: var(--about-muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: 600;
        }
        .contact-link {
          font-size: 1.25rem;
          text-decoration: none;
          color: var(--about-text);
          font-weight: 700;
          position: relative;
          display: inline-block;
          transition: color 0.3s ease;
        }
        .contact-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: var(--about-accent);
          transition: width 0.3s ease;
        }
        .contact-link:hover {
          color: var(--about-accent);
        }
        .contact-link:hover:after {
          width: 100%;
        }

        /* --- Activity --- */
        .about-activity {
          padding: 6rem 0;
          background: #000;
        }
        .about-activity__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
        }

        /* --- Vision --- */
        .about-vision {
          padding: 15rem 0;
          background: #111;
        }
        .about-vision__container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }
        .vision-text {
          font-size: clamp(1.75rem, 4vw, 3.25rem);
          font-weight: 500;
          line-height: 1.35;
          color: #fff;
          letter-spacing: -0.02em;
        }

        /* --- Projects --- */
        .about-projects {
          padding: 12rem 0;
        }
        .about-projects__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
        }
        .projects-wall {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4rem;
        }
        .project-node {
          position: relative;
          aspect-ratio: 16/10;
          background: var(--about-card-bg);
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .project-node:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .project-node__image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .project-node__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.7;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .project-node:hover .project-node__img {
          transform: scale(1.05);
          opacity: 0.4;
        }
        .project-node__overlay {
          position: absolute;
          inset: 0;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
        }
        .project-node__title {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -0.03em;
        }
        .project-node__desc {
          font-size: 1.1rem;
          color: #ccc;
          line-height: 1.6;
          max-width: 400px;
          margin-bottom: 2rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s ease 0.1s;
        }
        .project-node:hover .project-node__desc {
          opacity: 1;
          transform: translateY(0);
        }
        .project-node__link {
          text-decoration: none;
          color: var(--about-accent);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          transition: all 0.3s ease;
          width: fit-content;
        }
        .project-node__link:hover {
          letter-spacing: 0.25em;
        }

        /* --- Career Timeline --- */
        .about-career {
          padding: 12rem 0;
          background: #0f0f0f;
        }
        .about-career__container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .career-timeline {
          display: flex;
          flex-direction: column;
          gap: 6rem;
        }
        .career-item {
          display: flex;
          gap: 3rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        .career-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .career-item__logo {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          background: var(--about-card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .career-item__logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }
        .career-item__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
        }
        .career-item__title {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .career-item__date {
          font-size: 0.85rem;
          color: var(--about-muted);
          font-weight: 500;
        }
        .career-item__company {
          font-size: 1.2rem;
          font-weight: 500;
          color: #aaa;
          margin-bottom: 1.5rem;
        }
        .career-item__description {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #999;
        }

        /* --- Academic --- */
        .about-academic {
          padding: 12rem 0;
        }
        .about-academic__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
        }
        .academic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2.5rem;
        }
        .academic-card {
          display: flex;
          gap: 2rem;
          padding: 3rem;
          background: var(--about-card-bg);
          border: 1px solid var(--about-border);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .academic-card:hover {
          border-color: var(--about-accent);
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .academic-card__logo {
          width: 48px;
          height: 48px;
          background: #222;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          border-radius: 4px;
        }
        .academic-card__logo img { width: 100%; height: 100%; object-fit: contain; }
        .academic-card__school { 
          font-size: 1.3rem; 
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .academic-card__degree { 
          color: var(--about-muted); 
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .academic-card__date { 
          font-size: 0.8rem; 
          opacity: 0.6;
          font-weight: 500;
        }

        /* --- Skills --- */
        .about-skills {
          padding: 8rem 0 12rem;
        }
        .skills-track {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          justify-content: center;
        }
        .skill-chip {
          padding: 1.25rem 2.5rem;
          border: 1px solid var(--about-border);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 30px;
          transition: all 0.3s ease;
          background: var(--about-card-bg);
        }
        .skill-chip:hover {
          border-color: var(--about-accent);
          background: var(--about-hover-bg);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        /* --- Footer --- */
        .about-footer {
          padding: 8rem 0;
          border-top: 1px solid var(--about-border);
        }
        .about-footer__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .about-footer__left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .copyright { 
          font-weight: 800; 
          font-size: 0.85rem;
          letter-spacing: 0.05em;
        }
        .tagline { 
          font-size: 0.85rem; 
          color: var(--about-muted);
          font-weight: 500;
        }
        .about-footer__right {
          display: flex;
          gap: 2.5rem;
        }
        .about-footer__right a {
          text-decoration: none;
          color: var(--about-text);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          position: relative;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }
        .about-footer__right a:after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: var(--about-accent);
          transition: width 0.3s ease;
        }
        .about-footer__right a:hover {
          color: var(--about-accent);
        }
        .about-footer__right a:hover:after {
          width: 100%;
        }

        @media (max-width: 1024px) {
          .about-hero__grid { grid-template-columns: 1fr; gap: 4rem; }
          .projects-wall { grid-template-columns: 1fr; }
          .about-hero__container, .about-projects__container, .about-academic__container, .about-footer__container { padding: 0 2rem; }
          .about-hero { padding: 8rem 0 4rem; }
          .about-hero__header { margin-bottom: 4rem; }
          .about-hero__title { font-size: clamp(3rem, 8vw, 6rem); }
          .about-hero__bio-text { font-size: 1.5rem; }
          .about-projects, .about-career, .about-academic, .about-skills { padding: 8rem 0; }
        }
        
        @media (max-width: 768px) {
          .career-item { flex-direction: column; gap: 1.5rem; }
          .career-item__header { flex-direction: column; gap: 0.5rem; }
          .academic-grid { grid-template-columns: 1fr; }
          .stack-grid { grid-template-columns: 1fr; }
          .about-github-stats { gap: 2rem; }
          .stat-num { font-size: 2rem; }
          .about-footer__container { 
            flex-direction: column; 
            gap: 2rem;
            text-align: center;
          }
          .about-footer__right {
            justify-content: center;
          }
          .vision-text { font-size: clamp(1.5rem, 4vw, 2.5rem); }
        }
        
        @media (max-width: 480px) {
          .about-hero__container, .about-projects__container, .about-academic__container, .about-footer__container, .about-activity__container {
            padding: 0 1.5rem;
          }
          .about-hero { padding: 6rem 0 3rem; }
          .about-hero__title { font-size: clamp(2.5rem, 10vw, 4rem); }
          .about-hero__occupation { font-size: 1.3rem; }
          .about-hero__bio-text { font-size: 1.2rem; }
          .about-github-stats { gap: 1.5rem; }
          .stat-num { font-size: 1.75rem; }
          .section-title { font-size: clamp(2rem, 6vw, 3rem); }
          .project-node__title { font-size: 1.75rem; }
          .project-node__desc { font-size: 1rem; }
          .career-item__title { font-size: 1.4rem; }
          .career-item__company { font-size: 1rem; }
          .career-item__description { font-size: 0.95rem; }
          .academic-card { padding: 2rem; }
          .academic-card__school { font-size: 1.1rem; }
          .academic-card__degree { font-size: 1rem; }
          .skill-chip { 
            padding: 1rem 1.5rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
