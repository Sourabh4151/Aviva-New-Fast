import React from 'react';
import HeroSection from '../components/PortalHomePage/HeroSection.js';
import ProgramFeatures from '../components/PortalHomePage/ProgramFeatures.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const PortalHomePage = () => {
    return (
        <>
          <HeroSection />
          <ProgramFeatures />
        </>
    );
}

export default PortalHomePage;