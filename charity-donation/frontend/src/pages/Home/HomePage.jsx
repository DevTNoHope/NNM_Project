import { useState, useEffect } from 'react';
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
import {
  getPlatformStats,
  getNewlyEligibleProjects,
  getTopDonations,
  getRecentProjects,
  getLastUpdatedProjects
} from '../../api/homeApi';
import './HomePage.css';

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [eligibleProjects, setEligibleProjects] = useState([]);
  const [topDonations, setTopDonations] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [lastUpdated, setLastUpdated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligiblePagination, setEligiblePagination] = useState({ currentPage: 0, totalPages: 0 });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          statsRes,
          eligibleRes,
          donationsRes,
          recentRes,
          lastUpdatedRes
        ] = await Promise.all([
          getPlatformStats(),
          getNewlyEligibleProjects(0, 3),
          getTopDonations(5),
          getRecentProjects(3),
          getLastUpdatedProjects(10)
        ]);

        setStats(statsRes.data.data);
        setEligibleProjects(eligibleRes.data.data.projects);
        setEligiblePagination(eligibleRes.data.data.pagination);
        setTopDonations(donationsRes.data.data);
        setRecentProjects(recentRes.data.data);
        setLastUpdated(lastUpdatedRes.data.data);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handlePageChange = async (newPage) => {
    setLoading(true);
    try {
      const res = await getNewlyEligibleProjects(newPage, 3);
      setEligibleProjects(res.data.data.projects);
      setEligiblePagination(res.data.data.pagination);
      // Scroll to section? Optional.
    } catch (err) {
      console.error('Failed to change page:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <HeroSection stats={stats} />
      <FeatureSection />
      <EligibleProjectsSection 
        projects={eligibleProjects} 
        loading={loading} 
        pagination={eligiblePagination}
        onPageChange={handlePageChange}
      />
      <CauseSection projects={recentProjects} />
      <StatsSection stats={stats} />
      <AboutPlatformSection />
      <PartnersSection />
      <RecentPostsSection posts={recentProjects} topDonations={topDonations} />
      <NewsletterSection />
      <UpdatesSection updates={lastUpdated} />
    </div>
  );
};

export default HomePage;