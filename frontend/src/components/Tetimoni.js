import React from 'react';

const Tetimoni = () => {
  const cardsData = [
    {
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      name: 'Briar Martin',
      handle: '@neilstellar',
      date: '20 April 2025',
      text: 'Kulitnya tebal namun lentur, nyaman dipakai dan berbau khas premium.'
    },
    {
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      name: 'Avery Johnson',
      handle: '@averywrites',
      date: '10 Mei 2025',
      text: 'Finishing rapi, tekstur halus, warna tidak mudah pudar.'
    },
    {
      image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
      name: 'Jordan Lee',
      handle: '@jordantalks',
      date: '5 Juni 2025',
      text: 'Jahitan kuat dan presisi, terasa kokoh saat dipakai harian.'
    },
    {
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
      name: 'Avery Johnson',
      handle: '@averywrites',
      date: '10 Mei 2025',
      text: 'Perawatan mudah, semakin dipakai semakin cantik patinanya.'
    },
  ];

  const CreateCard = ({ card }) => (
    <div
      className="testimonial-card"
      style={{
        padding: 16,
        borderRadius: 12,
        marginLeft: 16,
        marginRight: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 200ms ease',
        width: '18rem',
        flexShrink: 0,
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <img
          style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover' }}
          src={card.image}
          alt="User"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <p style={{ margin: 0 }}>{card.name}</p>
            <svg
              style={{ marginTop: 2 }}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z"
                fill="#2196F3"
              />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{card.handle}</span>
        </div>
      </div>

      <p style={{ fontSize: 14, paddingTop: 16, paddingBottom: 16, color: '#1f2937' }}>
        {card.text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6b7280', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Posted on</span>
          <a href="https://x.com" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
            <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m.027 0 4.247 5.516L0 10h.962l3.742-3.926L7.727 10H11L6.514 4.174 10.492 0H9.53L6.084 3.616 3.3 0zM1.44.688h1.504l6.64 8.624H8.082z" fill="currentColor" />
            </svg>
          </a>
        </div>
        <p style={{ margin: 0 }}>{card.date}</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .marquee-inner { animation: marqueeScroll 25s linear infinite; }
        .marquee-reverse { animation-direction: reverse; }
        .testimonial-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
      `}</style>

      <div className="marquee-row" style={{ width: '100%', margin: '0 auto', maxWidth: '80rem', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 80, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))' }} />
        <div className="marquee-inner marquee-reverse" style={{ display: 'flex', transform: 'translateZ(0)', minWidth: '200%', paddingTop: 40, paddingBottom: 20 }}>
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 80, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))' }} />
      </div>
    </>
  );
};

export default Tetimoni;