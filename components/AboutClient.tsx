'use client';

import React, { useEffect, useRef } from 'react';
import ActivityHeatmap, { ActivityDay } from '@/components/ui/ActivityHeatmap';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface Role {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  employmentType?: string;
}

interface Position {
  company: string;
  logo?: string;
  location?: string;
  roles: Role[];
  // Keep legacy fields for migration support
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
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
  id?: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
  tags?: string[];
  skills?: string[];
  resources?: { title: string; url: string }[];
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

import MarkdownView from '@/components/ui/MarkdownView';

const MarkdownContent = ({ content, className }: { content: string, className?: string }) => (
  <MarkdownView content={content} className={className} />
);

export default function AboutClient({ profile, showBanner = false }: AboutClientProps) {
  const [hoveredProject, setHoveredProject] = React.useState<number | null>(null);
  const github = profile?.analytics?.github;
  
  const rawPositions = profile?.experience || [];
  
  // Migration helper: Convert flat structure to nested structure if needed
  const positions: Position[] = React.useMemo(() => {
    if (!rawPositions.length) {
      return [
        {
          company: "Thoughtjumper",
          roles: [{
            startDate: "2023",
            endDate: "Present",
            title: "Lead Engineer & Architect",
            description: "Architected core knowledge engines and full-stack orchestration layers, scaling critical platform infrastructure.",
          }]
        },
        {
          company: "Edvanta",
          roles: [{
            startDate: "2021",
            endDate: "2023",
            title: "Software Architect",
            description: "Engineered robust and scalable cloud-native backend systems, led enterprise database modeling, and optimized high-throughput APIs.",
          }]
        }
      ];
    }

    // Check if it's already nested or needs migration
    if (rawPositions[0] && rawPositions[0].roles) {
      return rawPositions;
    }

    // Migrate flat to nested (grouped by company)
    const grouped: Record<string, Position> = {};
    rawPositions.forEach(pos => {
      const company = pos.company;
      if (!grouped[company]) {
        grouped[company] = {
          company,
          logo: pos.logo,
          roles: []
        };
      }
      grouped[company].roles.push({
        title: pos.title!,
        startDate: pos.startDate!,
        endDate: pos.endDate!,
        description: pos.description!,
      });
    });
    return Object.values(grouped);
  }, [rawPositions]);
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
        <section className={`about-hero ${showBanner ? 'about-hero--with-banner' : ''}`}>
          <div className="about-hero__container">
            {showBanner && (
              <div className="about-hero__banner">
                <img 
                  src={profile?.coverURL || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'} 
                  alt="Cover" 
                  className="about-hero__banner-img" 
                />
                <div className="about-hero__banner-overlay" />
              </div>
            )}
            
            <div className={`about-hero__header ${showBanner ? 'about-hero__header--overlapped' : ''}`}>
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
                <div className="about-hero__bio-text">
                  <MarkdownContent 
                    content={profile?.bio || 'I am a lead developer specializing in building scalable backend systems, architecting cloud-native applications, and creating intuitive developer experiences.'} 
                  />
                </div>
                
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
                <div className="vision-text">
                   <MarkdownContent 
                    content={profile?.vision || 'TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn\'t just store data, but actively participates in value creation.'} 
                   />
                </div>
              </div>
           </div>
        </section>

        {/* --- Featured Projects --- */}
        {projects.length > 0 && (
          <section className="about-projects">
            <div className="about-projects__dynamic-bg" style={{ 
              backgroundImage: (hoveredProject !== null && projects[hoveredProject]?.image) 
                ? `url(${projects[hoveredProject].image})` 
                : (projects[0]?.image ? `url(${projects[0].image})` : 'none'),
              opacity: (hoveredProject !== null || projects[0]?.image) ? 0.15 : 0
            }} />
            <div className="about-projects__container">
              <h2 className="section-title">Selected Works</h2>
              <div className="projects-wall">
                {projects.map((project, i) => (
                  <div 
                    key={i} 
                    className="project-node"
                    onMouseEnter={() => setHoveredProject(i)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div className="project-node__image-wrapper">
                       {project.image ? (
                         <img src={project.image} alt={project.title} className="project-node__img" />
                       ) : (
                         <div className="project-node__placeholder" />
                       )}
                       <div className="project-node__overlay">
                          <div className="project-node__content">
                             <h3 className="project-node__title">{project.title}</h3>
                             <div className="project-node__desc">
                               <MarkdownContent content={project.description} />
                             </div>
                             {(project.tags?.length || project.skills?.length) && (
                               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.8rem 0' }}>
                                 {project.tags?.map(t => <span key={t} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', border: '1px solid rgba(255,255,255,0.2)' }}>{t}</span>)}
                                 {project.skills?.map(s => <span key={s} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>{s}</span>)}
                               </div>
                             )}
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
                      <h3 className="career-item__company">{pos.company}</h3>
                      {pos.location && <p className="career-item__location">{pos.location}</p>}
                      
                      <div className="career-roles">
                        {pos.roles.map((role, idx) => (
                          <div key={idx} className="career-role">
                            <div className="career-role__indicator">
                               <div className="role-dot" />
                               {idx < pos.roles.length - 1 && <div className="role-line" />}
                            </div>
                            <div className="career-role__content">
                              <div className="career-item__header">
                                <h4 className="career-role__title">{role.title}</h4>
                                <span className="career-item__date">{role.startDate} — {role.endDate}</span>
                              </div>
                              {role.employmentType && <p className="career-role__type">{role.employmentType}</p>}
                              <div className="career-item__description">
                                <MarkdownContent content={role.description} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
