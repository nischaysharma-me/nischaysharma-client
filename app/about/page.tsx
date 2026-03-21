'use client';

import React, { useState, useEffect } from 'react';
import Menu from '@/components/Menu';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import AdminLoading from '@/app/admin/loading';
import { format, parseISO } from 'date-fns';

export default function AboutPage() {
  const { isMenuOpen, toggleMenu } = useStore();
  const [profile, setProfile] = useState<any>(null);
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

  // Process Heatmap Data for GitHub Style Grid
  const renderHeatmap = () => {
    if (!github?.contributionCalendar) return null;

    const days = github.contributionCalendar.slice(-371); // Show ~1 year
    const monthLabels: { label: string; span: number }[] = [];
    
    let currentMonth = '';
    let span = 0;

    days.forEach((day: any, i: number) => {
      const date = new Date(day.date);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (i % 7 === 0) { // Every new column (week)
        if (month !== currentMonth) {
          if (currentMonth !== '') {
            monthLabels.push({ label: currentMonth, span });
          }
          currentMonth = month;
          span = 1;
        } else {
          span++;
        }
      }
    });
    // Add the last month
    monthLabels.push({ label: currentMonth, span });

    return (
      <section className="activity-monitor">
        <div className="activity-monitor__container">
          <h3 className="about-stats__label" style={{ marginBottom: '3rem' }}>Productivity Index</h3>
          
          <div className="activity-monitor__wrapper">
            <div className="activity-monitor__y-axis">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="activity-monitor__main">
              <div className="activity-monitor__x-axis">
                {monthLabels.map((m, i) => (
                  <span key={i} style={{ minWidth: `${m.span * 16}px` }}>{m.label}</span>
                ))}
              </div>
              <div className="activity-monitor__grid">
                {days.map((day: any, i: number) => (
                  <div 
                    key={i}
                    className="activity-monitor__day"
                    title={`${day.count} ${day.count === 1 ? 'Contribution' : 'Contributions'} on ${format(parseISO(day.date), 'MMMM do')}`}
                    style={{
                      background: day.level === 0 ? '#eee' : 
                                  day.level === 1 ? 'rgba(0,0,0,0.1)' :
                                  day.level === 2 ? 'rgba(0,0,0,0.3)' :
                                  day.level === 3 ? 'rgba(0,0,0,0.6)' : '#000'
                    }}
                  />
                ))}
              </div>

            </div>
          </div>

          <div className="activity-monitor__meta">
            <span>Synced via GitHub GraphQL</span>
            <div className="activity-monitor__legend">
              <span style={{ opacity: 0.5 }}>Less</span>
              <span style={{ background: '#eee' }} />
              <span style={{ background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ background: 'rgba(0,0,0,0.3)' }} />
              <span style={{ background: 'rgba(0,0,0,0.6)' }} />
              <span style={{ background: '#000' }} />
              <span style={{ opacity: 0.5 }}>More</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="landing-container">
      <Menu isOpen={isMenuOpen} onClose={() => toggleMenu()} />
      
      <header className="landing__header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Link href="/" className="landing__brand" style={{ textDecoration: 'none', color: 'inherit' }}>{profile?.displayName || 'NISCHAY SHARMA'}</Link>
        <div className="landing__logo">
          <i className="ph ph-stack" style={{ fontSize: '1.5rem' }} />
        </div>
        <button onClick={toggleMenu} className="landing__menu-btn">
          Menu
        </button>
      </header>

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

        {renderHeatmap()}

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
