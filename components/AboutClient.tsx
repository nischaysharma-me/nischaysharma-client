'use client';

import React from 'react';
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
}

interface Education {
  startDate: string;
  endDate: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
}

interface Project {
  title: string;
  description: string;
  link?: string;
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
    linkedin?: {
      positions?: Position[];
      education?: Education[];
    };
  };
}

interface AboutClientProps {
  profile: Profile | null;
}

export default function AboutClient({ profile }: AboutClientProps) {
  const github = profile?.analytics?.github;
  const linkedin = profile?.analytics?.linkedin;

  // Use profile fields if present, otherwise fallback to synced analytics
  const positions = (profile?.experience && profile.experience.length > 0) 
    ? profile.experience 
    : (linkedin?.positions || []);
    
  const education = (profile?.education && profile.education.length > 0)
    ? profile.education
    : (linkedin?.education || []);

  const skills = profile?.skills || [];
  const expertise = profile?.expertise || [];
  const projects = profile?.projects || [];

  return (
    <div className="landing-container">
      <main className="about-view">
        <section className="about-hero">
          <div className="about-hero__content">
            <span className="about-hero__eyebrow">The Architect</span>
            <h1 className="about-hero__title">
              {profile?.displayName?.split(' ')[0] || 'Nischay'}<br />
              {profile?.displayName?.split(' ')[1] || 'Sharma'}.
            </h1>
            
            <div className="about-grid">
              <div className="about-text">
                <p className="about-text__bio">
                  {profile?.bio || 'I am a lead developer specializing in building scalable backend systems, architecting cloud-native applications, and creating intuitive developer experiences.'}
                </p>
                {/* GitHub Summary Stats */}
                {github && (
                  <div className="github-impact">
                    <div className="github-impact__stat">
                      <span className="github-impact__number">{github.stats.totalRepos}</span>
                      <span className="github-impact__label">Repositories</span>
                    </div>
                    <div className="github-impact__stat">
                      <span className="github-impact__number">{github.stats.totalStars}</span>
                      <span className="github-impact__label">Stars Earned</span>
                    </div>
                    <div className="github-impact__stat">
                      <span className="github-impact__number">{github.stats.totalContributions}</span>
                      <span className="github-impact__label">Yearly Commits</span>
                    </div>
                    <div className="github-impact__stat">
                      <span className="github-impact__number">{github.stats.followerCount}</span>
                      <span className="github-impact__label">Followers</span>
                    </div>
                  </div>
                )}

              </div>
              
              <div className="about-stats">
                <div className="about-stats__item">
                  <span className="about-stats__label">Occupation</span>
                  <p className="about-stats__value">{profile?.occupation || 'AI Orchestrator'}</p>
                </div>
                
                {github?.languages && (
                  <div className="about-stats__item">
                    <span className="about-stats__label">Primary Stack</span>
                    <div className="stack-bar">
                      {github.languages.slice(0, 5).map((lang: Language) => (
                        <div 
                          key={lang.name} 
                          title={`${lang.name}: ${lang.percentage}%`}
                          style={{ width: `${lang.percentage}%`, background: lang.color || '#000' }} 
                        />
                      ))}
                    </div>
                    <div className="stack-list">
                      {github.languages.slice(0, 4).map((lang: Language) => (
                        <div key={lang.name} className="stack-list__item">
                           <span className="stack-list__dot" style={{ background: lang.color || '#000' }} />
                           <span style={{ fontWeight: 600 }}>{lang.name}</span>
                           <span style={{ opacity: 0.4 }}>{lang.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="about-stats__item">
                  <span className="about-stats__label">Contact</span>
                  <p className="about-stats__value">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {github?.contributionCalendar && (
          <section className="activity-monitor">
            <div className="activity-monitor__container">
              <ActivityHeatmap 
                data={github.contributionCalendar} 
                title="Productivity Index"
                limitDays={371}
              />
            </div>
          </section>
        )}

        {(expertise.length > 0 || skills.length > 0) && (
          <section className="expertise-section">
             <div className="expertise-section__container">
                <div className="expertise-grid">
                  {expertise.length > 0 && (
                    <div className="expertise-col">
                      <h3 className="expertise-title">Expertise</h3>
                      <div className="expertise-list">
                        {expertise.map(item => <div key={item} className="expertise-item">{item}</div>)}
                      </div>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="expertise-col">
                      <h3 className="expertise-title">Technical Skills</h3>
                      <div className="skills-cloud">
                        {skills.map(item => <span key={item} className="skill-tag">{item}</span>)}
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="projects-section">
            <div className="projects-section__container">
              <h2 className="projects-section__title">Featured Projects</h2>
              <div className="projects-grid">
                {projects.map((project, i) => (
                  <div key={i} className="project-card">
                    <h3 className="project-card__title">{project.title}</h3>
                    <p className="project-card__description">{project.description}</p>
                    {project.link && (
                      <a href={project.link} target="_blank" className="project-card__link">
                        VIEW PROJECT <i className="ph ph-arrow-up-right" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(positions.length > 0 || education.length > 0) && (
          <section className="timeline-section">
             <div className="timeline-section__container">
                <h2 className="timeline-section__title">Professional Timeline</h2>
                <div className="timeline">
                  {positions.map((pos: Position, i: number) => (
                    <div key={`pos-${i}`} className="timeline__item">
                      <div className="timeline__date">
                        {pos.startDate} — {pos.endDate}
                      </div>
                      <div className="timeline__content">
                        <h4 className="timeline__job-title">{pos.title}</h4>
                        <p className="timeline__company">{pos.company}</p>
                        <p className="timeline__description">{pos.description}</p>
                      </div>
                    </div>
                  ))}
                  {education.map((edu: Education, i: number) => (
                    <div key={`edu-${i}`} className="timeline__item timeline__item--edu">
                      <div className="timeline__date">
                        {edu.startDate} — {edu.endDate}
                      </div>
                      <div className="timeline__content">
                        <h4 className="timeline__job-title">{edu.degree}</h4>
                        <p className="timeline__company">{edu.school}</p>
                        <p className="timeline__description">{edu.fieldOfStudy}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        <section className="vision-section">
          <div className="vision-section__container">
            <h2 className="vision-section__title">The Vision</h2>
            <p className="vision-section__text">
              {profile?.vision || 'TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn\'t just store data, but actively participates in the value creation process through intelligent automation and orchestration.'}
            </p>
          </div>
        </section>

        <footer className="about-footer">
           <div className="about-footer__container">
              <div className="about-footer__copyright">© {new Date().getFullYear()} {profile?.displayName?.toUpperCase() || 'NISCHAY SHARMA'}</div>
              <div className="about-footer__socials">
                {profile?.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" className="about-footer__link">GITHUB</a>}
                {profile?.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" className="about-footer__link">LINKEDIN</a>}
                {profile?.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" className="about-footer__link">TWITTER</a>}
              </div>
           </div>
        </footer>
      </main>

      <style jsx global>{`
        .about-view {
          font-family: var(--font-sans, sans-serif);
        }
        
        .expertise-section, .projects-section {
          padding: 8rem 0;
          background: var(--color-bg-primary);
        }
        
        .expertise-section__container, .projects-section__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .expertise-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }
        
        .expertise-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 2rem;
          opacity: 0.4;
        }
        
        .expertise-item {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .skills-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .skill-tag {
          padding: 0.5rem 1rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          font-size: 0.875rem;
          border-radius: 2rem;
        }
        
        .projects-section__title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 4rem;
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .project-card {
          padding: 2.5rem;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          transition: all 0.3s ease;
        }
        
        .project-card:hover {
          border-color: var(--color-text-primary);
          transform: translateY(-5px);
        }
        
        .project-card__title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .project-card__description {
          font-size: 0.875rem;
          line-height: 1.6;
          opacity: 0.7;
          margin-bottom: 2rem;
        }
        
        .project-card__link {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .expertise-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
