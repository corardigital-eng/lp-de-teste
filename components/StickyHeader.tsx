import React, { useState, useEffect } from 'react';

export const StickyHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className={`font-bold text-lg md:text-xl tracking-tight ${isScrolled ? 'text-brand-dark' : 'text-white'}`}>
          Elaine Corrêa <span className="font-light opacity-80">| TRG</span>
        </div>
        <button
          onClick={scrollToContact}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
            isScrolled 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-white text-brand-dark hover:bg-gray-100'
          }`}
        >
          Agendar Agora
        </button>
      </div>
    </header>
  );
};