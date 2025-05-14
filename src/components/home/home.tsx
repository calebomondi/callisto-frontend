import { motion } from 'framer-motion';
import AnimatedSection from '../AnimatedSection/animatedsection';

import { LockKeyhole} from 'lucide-react';
import Solutions from './solutions';
import FAQ from './faq';
import Footer from './footer';
import Navbar from '../navbar/navbar';
import { useNavigate } from 'react-router-dom';
import Features from './features';
import Hero from './hero';
import TrustedBy from './trustedby';
import Stats from './stats';
import Benefits from './benefits';

export default function Home () {
  const navigate = useNavigate()

  const handleDash = () => {
    navigate("/documentation");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />
      <TrustedBy />

      {/* Statistics Section */}
      {/* <AnimatedSection>
        <StatisticsSection />
      </AnimatedSection> */}
      <Stats />
      <Solutions />

      {/* Features Section */}
      <Features />
      {/* Tokens Section 
      <AnimatedSection>
        <TokensSection />
      </AnimatedSection>
      */}
      <Benefits />

      {/* FAQ Section */}
      <AnimatedSection>
        <FAQ />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center" id="cta">
          <h2 className="text-2xl font-bold text-navy mb-4">Ready to Start Saving?</h2>
          <p className="text-lg mb-8">Join thousands of users who trust FVKRY PRVNTA with their assets</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:px-6 px-4 py-3 bg-amber-500 rounded-lg text-base font-semibold hover:bg-amber-500 hover:scale-105 transition-all flex items-center"
            onClick={handleDash}
          >
            Let's Get You Started
            <LockKeyhole className="ml-2 w-5 h-5 animate-pulse" />
          </motion.button>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <Footer />
    </div>
  );
};
