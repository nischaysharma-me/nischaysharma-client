'use client';

import React, { useState, useEffect } from 'react';
import Menu from '@/components/Menu';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import AdminLoading from '@/app/admin/loading';

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

      <main className="about-view" style={{ paddingTop: '10vh', minHeight: '100vh', background: '#fff' }}>
        <section className="about-hero" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="about-hero__content">
            <span className="articles-parallax__eyebrow" style={{ color: '#a3a3a3', marginBottom: '1rem', display: 'block' }}>
              The Architect
            </span>
            <h1 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.02em', margin: '0 0 4rem 0' }}>
              {profile?.displayName?.split(' ')[0] || 'Nischay'}<br />
              {profile?.displayName?.split(' ')[1] || 'Sharma'}.
            </h1>
            
            <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
              <div className="about-text">
                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#333', marginBottom: '2rem' }}>
                  {profile?.bio || 'I am a lead developer specializing in building scalable backend systems, architecting cloud-native applications, and creating intuitive developer experiences.'}
                </p>
                
                {/* GitHub Summary Stats */}
                {github && (
                  <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem' }}>
                    <div>
                      <span style={{ fontSize: '2rem', fontWeight: 800 }}>{github.stats.totalStars}</span>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>Stars Earned</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '2rem', fontWeight: 800 }}>{github.stats.totalContributions}</span>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>Yearly Commits</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '2rem', fontWeight: 800 }}>{github.stats.followerCount}</span>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>Followers</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="about-stats" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Occupation</span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>{profile?.occupation || 'AI Orchestrator'}</p>
                </div>
                
                {/* Tech Stack Percentage Bar */}
                {github?.languages && (
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '1rem', display: 'block' }}>Primary Stack</span>
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#eee', marginBottom: '1rem' }}>
                      {github.languages.slice(0, 5).map((lang: any) => (
                        <div 
                          key={lang.name} 
                          title={`${lang.name}: ${lang.percentage}%`}
                          style={{ width: `${lang.percentage}%`, background: lang.color || '#000' }} 
                        />
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {github.languages.slice(0, 4).map((lang: any) => (
                        <div key={lang.name} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lang.color || '#000' }} />
                           <span style={{ fontWeight: 600 }}>{lang.name}</span>
                           <span style={{ opacity: 0.4 }}>{lang.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Contact</span>
                  <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GitHub Activity Heatmap Section */}
        {github?.contributionCalendar && (
          <section style={{ padding: '6rem 2rem', background: '#fcfcfc', borderY: '1px solid #eee' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '2rem' }}>
                Activity Monitor
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {github.contributionCalendar.slice(-200).map((day: any, i: number) => (
                  <div 
                    key={i}
                    title={`${day.date}: ${day.count} contributions`}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '1px',
                      background: day.level === 0 ? '#eee' : 
                                  day.level === 1 ? '#d1d5db' :
                                  day.level === 2 ? '#9ca3af' :
                                  day.level === 3 ? '#4b5563' : '#000'
                    }}
                  />
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.65rem', opacity: 0.4 }}>
                Real-time contribution frequency synced via GitHub GraphQL.
              </p>
            </div>
          </section>
        )}

        {/* LinkedIn Experience Section */}
        {linkedin?.positions && linkedin.positions.length > 0 && (
          <section style={{ padding: '8rem 2rem' }}>
             <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4rem' }}>Professional Timeline</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                  {linkedin.positions.map((pos: any, i: number) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.4, paddingTop: '0.5rem' }}>
                        {pos.startDate} — {pos.endDate}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{pos.title}</h4>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '0.25rem' }}>{pos.company}</p>
                        <p style={{ marginTop: '1.5rem', color: '#666', lineHeight: 1.6, maxWidth: '700px' }}>{pos.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </section>
        )}

        <section className="about-vision" style={{ padding: '8rem 2rem', background: '#000', color: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '4rem', letterSpacing: '-0.02em' }}>The Vision</h2>
            <div style={{ maxWidth: '800px' }}>
              <p style={{ fontSize: '1.5rem', lineHeight: 1.4, opacity: 0.8, marginBottom: '2rem' }}>
                {profile?.preferences?.visionStatement || 'TaughtCode aims to become the standard for "Smart Backend" architectures—where infrastructure doesn\'t just store data, but actively participates in the value creation process through intelligent automation and orchestration.'}
              </p>
            </div>
          </div>
        </section>

        <section className="about-footer" style={{ padding: '4rem 2rem', borderTop: '1px solid #eee' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.4 }}>© {new Date().getFullYear()} {profile?.displayName?.toUpperCase() || 'NISCHAY SHARMA'}</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {profile?.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>GITHUB</a>}
                {profile?.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>LINKEDIN</a>}
                {profile?.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', textDecoration: 'none' }}>TWITTER</a>}
              </div>
           </div>
        </section>
      </main>

      <style jsx global>{`
        .about-view {
          font-family: var(--font-sans, sans-serif);
        }
      `}</style>
    </div>
  );
}
