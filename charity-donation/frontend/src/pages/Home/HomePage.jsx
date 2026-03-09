import HeroSection from '../../components/home/HeroSection';
import FeatureSection from '../../components/home/FeatureSection';
import EligibleProjectsSection from '../../components/home/EligibleProjectsSection';
import CauseSection from '../../components/home/CauseSection';
import StatsSection from '../../components/home/StatsSection';
import AboutPlatformSection from '../../components/home/AboutPlatformSection';
import PartnersSection from '../../components/home/PartnersSection';
import RecentPostsSection from '../../components/home/RecentPostsSection';
import NewsletterSection from '../../components/home/NewsletterSection';
import UpdatesSection from '../../components/home/UpdatesSection';
import './HomePage.css';

const HomePage = () => (
  <div className="home-page">
    <HeroSection />
    <FeatureSection />
    <EligibleProjectsSection />
    <CauseSection />
    <StatsSection />
    <AboutPlatformSection />
    <PartnersSection />
    <RecentPostsSection />
    <NewsletterSection />
    <UpdatesSection />
  </div>
);
export default HomePage;