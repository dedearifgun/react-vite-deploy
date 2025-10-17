import React from 'react';
import Hero from '../components/Hero';
import Tetimoni from '../components/Tetimoni';
import NewArrivals from '../components/NewArrivals';

const HomePage = () => {
  // Kategori Populer dan Produk Unggulan dihapus sesuai permintaan

  return (
    <>
      <Hero />
      <Tetimoni />
      {/* New Arrivals versi overlay */}
      <NewArrivals />
    </>
  );
};

export default HomePage;