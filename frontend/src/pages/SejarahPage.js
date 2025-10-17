import React from 'react';
import { Container } from 'react-bootstrap';

const SejarahPage = () => {
  return (
    <Container className="py-5 with-navbar-offset history-page">
      <header className="history-header mb-4">
        <h1 className="mb-2">Sejarah</h1>
        <p className="text-muted">Perjalanan narpati leather, 2010—sekarang.</p>
      </header>

      <div className="timeline">
        <div className="timeline-item">
          <span className="timeline-dot" />
          <div className="timeline-year">2010</div>
          <div className="timeline-card">
            <h3 className="timeline-title">Awal Berdiri</h3>
            <p>Berawal dari workshop kecil dengan visi sederhana: kualitas nomor satu, ketelitian, dan integritas dalam setiap produk.</p>
          </div>
        </div>

        <div className="timeline-item">
          <span className="timeline-dot" />
          <div className="timeline-year">2014</div>
          <div className="timeline-card">
            <h3 className="timeline-title">Tumbuh Pesat</h3>
            <p>Koleksi bertambah, proses produksi makin rapi. Reseller pertama mulai bergabung dan memperluas jangkauan kami.</p>
          </div>
        </div>

        <div className="timeline-item">
          <span className="timeline-dot" />
          <div className="timeline-year">2018</div>
          <div className="timeline-card">
            <h3 className="timeline-title">Ekspansi Nasional</h3>
            <p>Masuk ke platform e‑commerce dan memperkuat jaringan reseller di berbagai kota. Pertumbuhan penjualan meningkat signifikan.</p>
          </div>
        </div>

        <div className="timeline-item">
          <span className="timeline-dot" />
          <div className="timeline-year">2022</div>
          <div className="timeline-card">
            <h3 className="timeline-title">Percepatan & Kolaborasi</h3>
            <p>Skala operasi naik; gudang terpusat, QA makin ketat, dan dukungan pelanggan lebih responsif. Jumlah reseller terus bertambah.</p>
          </div>
        </div>

        <div className="timeline-item timeline-item--now">
          <span className="timeline-dot" />
          <div className="timeline-year">Sekarang</div>
          <div className="timeline-card">
            <h3 className="timeline-title">Toko Besar. Tampilan Baru.</h3>
            <p>narpati leather kini beroperasi dalam skala besar dengan jaringan reseller yang luas. Kami terus berinovasi menghadirkan tampilan yang lebih modern dan pengalaman belanja yang menyenangkan—dengan komitmen yang sama: kualitas tertinggi dan harga jujur.</p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SejarahPage;