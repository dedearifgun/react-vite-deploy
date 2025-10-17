import React from 'react';
import Hero from '../components/Hero';
import Tetimoni from '../components/Tetimoni';
import CategoryNav from '../components/CategoryNav';
import NewArrivals from '../components/NewArrivals';
import MarketingTeam from '../components/MarketingTeam';

const HomePage = () => {
  // Kategori Populer dan Produk Unggulan dihapus sesuai permintaan

  return (
    <>
      {/* Halaman awal: Hero penuh lalu Testimoni */}
      <Hero />
      <Tetimoni />
      {/* Konten lain setelahnya */}
      <CategoryNav />
      <NewArrivals />
      <MarketingTeam />
    </>
  );
};

export default HomePage;