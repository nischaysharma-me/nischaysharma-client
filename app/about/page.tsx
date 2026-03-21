'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import AdminLoading from '@/app/admin/loading';
import ActivityHeatmap from '@/components/ui/ActivityHeatmap';

interface Profile {
  displayName?: string;
  bio?: string;
  occupation?: string;
  email?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  preferences?: {
    visionStatement?: string;
  };
  analytics?: {
    github?: {
      stats: {
        totalRepos: number;
        totalStars: number;
        totalContributions: number;
        followerCount: number;
      };
      languages?: Array<{
        name: string;
        percentage: number;
        color?: string;
      }>;
      contributionCalendar?: any[];
    };
    linkedin?: {
      positions?: Array<{
        startDate: string;
        endDate: string;
        title: string;
        company: string;
        description: string;
      }>;
    };
  };
}

export default function AboutPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      let res;
      if (token) {
        res = await usersService.getMe(token);
      } else {
        // Fetch public admin profile if not logged in
        res = await usersService.getPublicAdmin();
      }

      if (res && res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Error fetching about data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLoading />;

  const github = profile?.analytics?.github;
  const linkedin = profile?.analytics?.linkedin;

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
                      {github.languages.slice(0, 5).map((lang: any) => (
                        <div 
                          key={lang.name} 
                          title={`${lang.name}: ${lang.percentage}%`}
                          style={{ width: `${lang.percentage}%`, background: lang.color || '#000' }} 
                        />
                      ))}
                    </div>
                    <div className="stack-list">
                      {github.languages.slice(0, 4).map((lang: any) => (
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

        {linkedin?.positions && linkedin.positions.length > 0 && (
          <section className="timeline-section">
             <div className="timeline-section__container">
                <h2 className="timeline-section__title">Professional Timeline</h2>
                <div className="timeline">
                  {linkedin.positions.map((pos: any, i: number) => (
                    <div key={i} className="timeline__item">
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
                </div>
             </div>
          </section>
        )}

        <section className="vision-section">
          <div className="vision-section__container">
            <h2 className="vision-section__title">The Vision</h2>
            <p className="vision-section__text">
              {profile?.preferences?.visionStatement || 'TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn\'t just store data, but actively participates in the value creation process through intelligent automation and orchestration.'}
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
      `}</style>
    </div>
  );
}
