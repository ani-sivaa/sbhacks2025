'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, GraduationCap, Menu, X } from 'lucide-react';

interface NavbarProps {
  onResetCourse?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onResetCourse }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsNavVisible(e.clientY <= 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    
    // Reset course selection state
    if (onResetCourse) {
      onResetCourse();
    }

    // If on home page, handle scroll to course explorer
    if (pathname === '/' && href === '/#course-explorer') {
      const courseExplorer = document.querySelector('#course-explorer');
      if (courseExplorer) {
        courseExplorer.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to the specified route
      router.push(href);
    }

    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const navItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: <Home className="w-5 h-5" />
    },
    { 
      name: 'Courses', 
      href: '/#course-explorer', 
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      name: 'About', 
      href: '/about', 
      icon: <GraduationCap className="w-5 h-5" /> 
    },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-gray-800 z-50 
        transition-all duration-300 ease-in-out 
        ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              onClick={(e) => handleNavigation(e, '/')}
              className="flex items-center"
            >
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">
                GauchoCourse
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-br from-gray-900 to-black transition-colors"
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigation(e, item.href)}
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;