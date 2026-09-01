import Navbar from "../components/shared/Navbar";
import Hero from "../components/landing/Hero";
import CandidateCohorts from "../components/landing/CandidateCohorts";
import Transformation from "../components/landing/Transformation";
import MultiAgentEngine from "../components/landing/MultiAgentEngine";
import HowItWorks from "../components/landing/HowItWorks";
import ForEmployers from "../components/landing/ForEmployers";
import Footer from "../components/shared/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <CandidateCohorts />
      <Transformation />
      <MultiAgentEngine />
      <HowItWorks />
      <ForEmployers />
      <Footer />
    </div>
  );
};

export default Landing;
