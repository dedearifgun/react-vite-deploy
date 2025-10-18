import React from 'react';

const Tetimoni = () => {
  const cardsData = [
    {
      image: 'https://i.pravatar.cc/100?img=12',
      name: 'Ibu Anita Sari',
      handle: 'Ibu Rumah Tangga',
      text: 'Dompet kulitnya awet, jahitan rapi, cocok untuk dipakai harian.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=5',
      name: 'Pak Budi Santoso',
      handle: 'PNS',
      text: 'Kualitas premium, warna elegan. Sangat cocok untuk keperluan dinas.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=47',
      name: 'Ibu Dewi Kartika',
      handle: 'Guru',
      text: 'Ringan dan nyaman dipakai. Material kulitnya terasa lembut dan kuat.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=31',
      name: 'Pak Andi Pratama',
      handle: 'Kepala Dinas',
      text: 'Desain profesional, sangat menunjang penampilan saat rapat dan acara resmi.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=58',
      name: 'Ibu Sinta Rahma',
      handle: 'Wiraswasta',
      text: 'Produk kulitnya kuat dan tidak mudah pudar. Pelayanan toko ramah.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=62',
      name: 'Pak Rudi Hartono',
      handle: 'Bapak Karyawan',
      text: 'Ikat pinggang sangat mantap, finishing rapi dan nyaman dipakai.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=39',
      name: 'Ibu Maya Putri',
      handle: 'Ibu Kantoran',
      text: 'Tas kulitnya elegan, jahitan halus, dan muat banyak barang.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=67',
      name: 'Pak Agus Widodo',
      handle: 'PNS',
      text: 'Kulitnya tebal namun lentur, nyaman dipakai. Worth it sekali.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=15',
      name: 'Ibu Lina Wulandari',
      handle: 'Ibu Rumah Tangga',
      text: 'Dompet wanita modelnya cantik, kuat, dan tahan lama.'
    },
    {
      image: 'https://i.pravatar.cc/100?img=25',
      name: 'Pak Heru Susanto',
      handle: 'Kepala Dinas',
      text: 'Kualitas kulit terbaik. Patina semakin cantik seiring pemakaian.'
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
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{card.handle}</span>
        </div>
      </div>

      <p style={{ fontSize: 14, paddingTop: 16, paddingBottom: 16, color: '#1f2937' }}>
        {card.text}
      </p>

      {/* Footer dihapus sesuai permintaan (Posted on X) */}
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
        /* Pause saat hover di area marquee */
        .marquee-row:hover .marquee-inner { animation-play-state: paused; }
        .testimonial-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
      `}</style>

      <div className="marquee-row" style={{ width: '100%', margin: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 80, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))' }} />
        <div className="marquee-inner marquee-reverse" style={{ display: 'flex', transform: 'translateZ(0)', minWidth: '200%', paddingTop: 12, paddingBottom: 16 }}>
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