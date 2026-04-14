import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="bg-[#0b0e14] min-h-screen text-[#ecedf6] font-['Manrope'] selection:bg-[#7cafff]/30 selection:text-[#7cafff]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
