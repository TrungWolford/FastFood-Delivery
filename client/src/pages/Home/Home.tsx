// src/pages/Home/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../../components/ui/Header/Header';
import MainBanner from '../../components/MainBanner';
import RestaurantGrid from '../../components/RestaurantGrid';
import Footer from '../../components/ui/Footer/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      {/* Hero Section with Main Banner */}
      <section className="container mx-auto px-4 py-6">
        <MainBanner />
      </section>
      
      {/* Featured Restaurants */}
      <section className="container mx-auto px-36 py-8">
        <RestaurantGrid 
          title="Nhà hàng nổi bật"
          limit={6}
          showViewAll={false}
        />
        
        {/* Button Xem tất cả nhà hàng */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/restaurants')}
            className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Xem tất cả nhà hàng
          </button>
        </div>
      </section>
      
      
      
      <Footer />
    </div>
  );
};

export default Home;