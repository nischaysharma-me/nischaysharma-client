'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Blogs', href: '/#blogs' },
  { label: 'Contact', href: '/#contact' },
];

export default function Menu({ isOpen, onClose }: MenuProps) {
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
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="menu__link"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="menu__socials">
            {['Instagram', 'LinkedIn', 'Twitter'].map((social) => (
              <a key={social} href="#" className="menu__social-link">
                {social}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
