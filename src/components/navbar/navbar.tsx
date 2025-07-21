import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";
import { motion } from 'framer-motion';
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [isVisible, setIsVisible] = useState(true);

    const navigate = useNavigate();

    const handleDash = () => {
      navigate("/dashboard");
    }

    useEffect(() => {
        let lastScrollY = window.scrollY;
    
        const handleScroll = () => {
          const currentScrollY = window.scrollY;
          setIsVisible(lastScrollY > currentScrollY || currentScrollY < 50);
          lastScrollY = currentScrollY;
    
          // Update active section
          const sections = ['hero', 'stats', 'features', 'tokens', 'faq', 'cta'];
          const currentSection = sections.find(section => {
            const element = document.getElementById(section);
            if (element) {
              const rect = element.getBoundingClientRect();
              return rect.top <= 100 && rect.bottom >= 100;
            }
            return false;
          });
          if (currentSection) setActiveSection(currentSection);
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isVisible ? 'top-0' : '-top-20'}
        ${activeSection === 'hero' ? ' bg-gray-900 ' : 'bg-gradient-to-b from-gray-900 to-black backdrop-blur-md  shadow-lg'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between md:h-20 h-16">
            <div className="flex items-center justify-center space-x-5">
              <a href="/">
                <img
                  src="new_logo.png"
                  alt=""
                  className='md:w-8 w-6'
                />
              </a>
              <span className="text-sm bg-green-600/60 py-1 px-2 rounded-md">beta</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {[''].map((item) => (
                <a
                  key={item}
                  href={item == "How It Works" ? `/documentation` : `/#${item.toLowerCase().replace(' ', '-')}`}
                  className={`transition-all duration-300  relative after:content-[''] after:absolute after:w-0 after:h-0.5
                    after:bg-amber-600 after:left-0 after:bottom-0 after:transition-all hover:after:w-full
                    ${activeSection === item.toLowerCase().replace(' ', '-') ? 'after:w-full' : ''}`}
                >
                  {item}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:px-5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-base font-semibold hover:scale-105 transition-all flex items-center"
                onClick={handleDash}
              >
                Launch App
                <LockKeyhole className="ml-2 w-5 h-5 animate-pulse" />
              </motion.button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div 
            className={`md:hidden flex justify-center absolute w-full  ${activeSection === 'hero' ? ' bg-gray-900 ' : 'bg-gradient-to-b from-gray-900 to-black backdrop-blur-md  shadow-lg'} text-gray-800 rounded-xl`}
          >
            <div className="px-2 pb-3">
              {[''].map((item) => (
                <a
                  key={item}
                  href={item == "How It Works" ? `/documentation` : `/#${item.toLowerCase().replace(' ', '-')}`}
                  className="block px-3 py-2 hover:text-amber-600 text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:px-5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:scale-105 transition-all flex items-center"
                onClick={handleDash}
              >
                Launch App
                <LockKeyhole className="ml-2 w-5 h-5 animate-pulse" />
              </motion.button>
            </div>
          </div>
        )}
    </nav>
  )
}
