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
  photoURL?: string;
  coverURL?: string;
}

interface AboutClientProps {
  profile: Profile | null;
  showBanner?: boolean;
}

export default function AboutClient({ profile, showBanner = false }: AboutClientProps) {
  const github = profile?.analytics?.github;
  
  const positions = profile?.experience || [];
  const education = profile?.education || [];
  const skills = profile?.skills?.length ? profile.skills : ['TypeScript', 'Node.js', 'Next.js', 'React', 'Python', 'Go', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST APIs', 'System Design'];
  const expertise = profile?.expertise?.length ? profile.expertise : ['System Architecture', 'Cloud Infrastructure', 'API Design', 'Database Modeling', 'DevOps', 'Security'];
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
        <section className={`about-hero ${showBanner && profile?.coverURL ? 'about-hero--with-banner' : ''}`}>
          <div className="about-hero__container">
            {showBanner && profile?.coverURL && (
              <div className="about-hero__banner">
                <img src={profile.coverURL} alt="Cover" className="about-hero__banner-img" />
              </div>
            )}
            
            <div className={`about-hero__header ${showBanner && profile?.coverURL ? 'about-hero__header--overlapped' : ''}`}>
              <div className="about-hero__identity">
                <div className="about-hero__avatar">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName || 'Profile'} className="about-hero__avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profile?.displayName?.[0] || 'N'}
                    </div>
                  )}
                </div>
                <div className="about-hero__titles">
                  <span className="about-hero__eyebrow">Digital Anthology & Portfolio</span>
                  <h1 className="about-hero__title">
                    {profile?.displayName || 'Nischay Sharma'}
                  </h1>
                  <p className="about-hero__occupation">{profile?.occupation || 'Software Architect'}</p>
                </div>
              </div>
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

    </div>
  );
}
