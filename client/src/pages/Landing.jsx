import Navbar from "../components/shared/Navbar";
import Hero from "../components/landing/Hero";
import Transformation from "../components/landing/Transformation";
import HowItWorks from "../components/landing/HowItWorks";
import ExperienceToSkills from "../components/landing/ExperienceToSkills";
import Footer from "../components/shared/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <Transformation />
      <HowItWorks />
      <ExperienceToSkills />
      <Footer />
    </div>
  );
};

export default Landing;
