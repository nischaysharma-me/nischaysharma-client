'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

const menuItems = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Blogs', href: '#blogs' },
  { label: 'Contact', href: '#contact' },
];

export default function Menu({ isOpen, onClose, profile }: MenuProps) {
  const socialLinks = profile?.socialLinks || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="menu"
        >
          <button onClick={onClose} className="menu__close">
            — Close
          </button>

          <nav className="menu__nav">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="menu__link"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="menu__socials">
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="menu__social-link">Twitter</a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="menu__social-link">LinkedIn</a>
            )}
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noreferrer" className="menu__social-link">GitHub</a>
            )}
            {socialLinks.website && (
              <a href={socialLinks.website} target="_blank" rel="noreferrer" className="menu__social-link">Website</a>
            )}
            {!socialLinks.twitter && !socialLinks.linkedin && !socialLinks.github && !socialLinks.website && (
              ['Instagram', 'LinkedIn', 'Twitter'].map((social) => (
                <a key={social} href="#" className="menu__social-link">
                  {social}
                </a>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
