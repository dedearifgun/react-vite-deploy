import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import { statsAPI } from '../../utils/api';
import { LineChart } from '@mui/x-charts/LineChart';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    todayProducts: 0,
    todayCategories: 0,
    todayWaClicks: 0,
    dailyProducts: [],
    dailyCategories: [],
    dailyWaClicks: [],
    dailyLogs: [],
  });

  // Kontrol rentang waktu: bulan & tahun yang dipilih
  const nowInit = new Date();
  const [selectedMonth, setSelectedMonth] = useState(nowInit.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(nowInit.getFullYear());
  // Quote of the Day & waktu WIB
  const [quote, setQuote] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Helper: jumlah hari dalam bulan tertentu
  const getDaysInMonth = (year, month /* 0-11 */) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const buildMonthDailySeries = (daily = [], year, month /* 0-11 */) => {
    const daysInMonth = getDaysInMonth(year, month);
    const counts = new Array(daysInMonth).fill(0);
    daily.forEach((d) => {
      const dt = new Date(d.date);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        const idx = day - 1;
        counts[idx] = Number(d.count || 0);
      }
    });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { days, counts };
  };

  // Helper: format waktu WIB (Asia/Jakarta)
  const formatWIB = () => {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
    return `${formatter.format(new Date())} WIB`;
  };

  useEffect(() => {
    // Ambil statistik totals, hari ini, dan harian (365 hari untuk dukungan pemilihan bulan)
    const fetchStats = async () => {
      try {
        const [totalsRes, todayRes, dailyRes] = await Promise.all([
          statsAPI.getTotals(),
          statsAPI.getToday(),
          statsAPI.getDailyWith({ days: 365, metric: 'products,whatsapp_click,logs' }),
        ]);

        const totals = totalsRes?.data?.data || {};
        const today = todayRes?.data?.data || {};
        const daily = dailyRes?.data?.data || {};

        setStats(prev => ({
          ...prev,
          totalProducts: Number(totals.totalProducts || 0),
          totalCategories: Number(totals.totalCategories || 0),
          todayProducts: Number(today.productsCreated || 0),
          todayCategories: Number(today.categoriesCreated || 0),
          todayWaClicks: Number(today.whatsappClicks || 0),
          dailyProducts: Array.isArray(daily.productsCreated) ? daily.productsCreated : [],
          dailyWaClicks: Array.isArray(daily.whatsappClicks) ? daily.whatsappClicks : [],
          dailyLogs: Array.isArray(daily.logs) ? daily.logs : [],
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Ambil Quote of the Day dari internet (dengan fallback agar pasti tampil)
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Prioritaskan Quotable (CORS baik)
        const res1 = await fetch('https://api.quotable.io/random?maxLength=140');
        if (res1.ok) {
          const d1 = await res1.json();
          setQuote(d1.content || '');
          setQuoteAuthor(d1.author || '');
          return;
        }
        // Fallback: ZenQuotes (kadang CORS)
        const res2 = await fetch('https://zenquotes.io/api/today');
        if (res2.ok) {
          const d2 = await res2.json();
          const q = Array.isArray(d2) && d2[0] ? d2[0] : null;
          if (q) {
            setQuote(q.q || '');
            setQuoteAuthor(q.a || '');
            return;
          }
        }
        // Fallback terakhir: DummyJSON
        const res3 = await fetch('https://dummyjson.com/quotes/random');
        if (res3.ok) {
          const d3 = await res3.json();
          setQuote(d3.quote || 'Tetap semangat, lakukan yang terbaik hari ini!');
          setQuoteAuthor(d3.author || '');
          return;
        }
        // Jika tetap gagal, set quote default
        setQuote('Tetap semangat, lakukan yang terbaik hari ini!');
        setQuoteAuthor('');
      } catch (e) {
        console.error('Error fetching quote:', e);
        setQuote('Tetap semangat, lakukan yang terbaik hari ini!');
        setQuoteAuthor('');
      }
    };
    fetchQuote();
  }, []);

  // Waktu WIB real-time
  useEffect(() => {
    setCurrentTime(formatWIB());
    const t = setInterval(() => setCurrentTime(formatWIB()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Dashboard | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center" style={{ gap: 16 }}>
              <h2 className="admin-title mb-0">Dashboard</h2>
              <div className="text-muted small" style={{ maxWidth: 520, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {quote ? `“${quote}”${quoteAuthor ? ` — ${quoteAuthor}` : ''}` : 'Memuat quote...'}
              </div>
            </div>
            {/* Kontrol rentang waktu: Bulan & Tahun */}
            <div className="d-flex align-items-center" style={{ gap: 12 }}>
              <div className="text-muted small me-2" style={{ whiteSpace: 'nowrap' }}>{currentTime || 'Memuat waktu...'}</div>
              <Form.Select
                size="sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                aria-label="Pilih Bulan"
                style={{ maxWidth: 140 }}
              >
                {[
                  'Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'
                ].map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </Form.Select>
              <Form.Select
                size="sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Pilih Tahun"
                style={{ maxWidth: 110 }}
              >
                {Array.from({ length: 5 }, (_, i) => nowInit.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </div>
          </div>

          {/* Header informasi: waktu sudah tampil di header; kartu WIB dihapus */}
          {/* Kartu paling atas: klik WhatsApp per hari */}
          <Row className="mb-3">
            <Col md={12}>
              <Card className="mb-3 dashboard-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div>
                      <h6 className="text-muted">Chat (WhatsApp) Hari Ini</h6>
                      <h3>{stats.todayWaClicks}</h3>
                    </div>
                  </div>
                  {/* LineChart harian per bulan dipilih */}
                  <div className="mt-3">
                    {(() => {
                      const { days, counts } = buildMonthDailySeries(stats.dailyWaClicks, selectedYear, selectedMonth);
                      const total = counts.reduce((s, n) => s + (Number(n) || 0), 0);
                      return (
                        <>
                          <LineChart
                            xAxis={[{ data: days, label: 'Tanggal', valueFormatter: (v) => String(v).padStart(2, '0') }]}
                            series={[{ label: 'Chat (WA)', data: counts, color: '#ffc107', curve: 'monotoneX', showMark: true }]}
                            grid={{ vertical: true, horizontal: true }}
                            height={220}
                            sx={{
                              '& .MuiChartsGrid-line': { stroke: '#e0e0e0', strokeWidth: 1, opacity: 0.6 },
                              '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fontSize: 11 },
                            }}
                            slotProps={{ legend: { hidden: false } }}
                          />
                          {total === 0 && (
                            <div className="text-muted small mt-2">Belum ada data bulan ini</div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-3 dashboard-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div>
                      <h6 className="text-muted">Total Produk</h6>
                      <h3>{stats.totalProducts}</h3>
                      <div className="text-muted">Hari ini: {stats.todayProducts}</div>
                    </div>
                  </div>
                  {/* LineChart harian per bulan dipilih */}
                  <div className="mt-3">
                    {(() => {
                      const { days, counts } = buildMonthDailySeries(stats.dailyProducts, selectedYear, selectedMonth);
                      const total = counts.reduce((s, n) => s + (Number(n) || 0), 0);
                      return (
                        <>
                          <LineChart
                            xAxis={[{ data: days, label: 'Tanggal', valueFormatter: (v) => String(v).padStart(2, '0') }]}
                            series={[{ label: 'Produk', data: counts, color: '#0d6efd', curve: 'monotoneX', showMark: true }]}
                            grid={{ vertical: true, horizontal: true }}
                            height={200}
                            sx={{
                              '& .MuiChartsGrid-line': { stroke: '#e0e0e0', strokeWidth: 1, opacity: 0.6 },
                              '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fontSize: 11 },
                            }}
                            slotProps={{ legend: { hidden: false } }}
                          />
                          {total === 0 && (
                            <div className="text-muted small mt-2">Belum ada data bulan ini</div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-3 dashboard-card">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div>
                      <h6 className="text-muted">Total Log</h6>
                      <h3>{(() => {
                        const { counts } = buildMonthDailySeries(stats.dailyLogs, selectedYear, selectedMonth);
                        return counts.reduce((s, n) => s + (Number(n) || 0), 0);
                      })()}</h3>
                      <div className="text-muted">Hari ini: {(() => {
                        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
                        const found = (stats.dailyLogs || []).find(d => d.date === todayStr);
                        return found ? Number(found.count || 0) : 0;
                      })()}</div>
                    </div>
                  </div>
                  {/* LineChart harian per bulan dipilih */}
                  <div className="mt-3">
                    {(() => {
                      const { days, counts } = buildMonthDailySeries(stats.dailyLogs, selectedYear, selectedMonth);
                      const total = counts.reduce((s, n) => s + (Number(n) || 0), 0);
                      return (
                        <>
                          <LineChart
                            xAxis={[{ data: days, label: 'Tanggal', valueFormatter: (v) => String(v).padStart(2, '0') }]}
                            series={[{ label: 'Log', data: counts, color: '#6c757d', curve: 'monotoneX', showMark: true }]}
                            grid={{ vertical: true, horizontal: true }}
                            height={200}
                            sx={{
                              '& .MuiChartsGrid-line': { stroke: '#e0e0e0', strokeWidth: 1, opacity: 0.6 },
                              '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fontSize: 11 },
                            }}
                            slotProps={{ legend: { hidden: false } }}
                          />
                          {total === 0 && (
                            <div className="text-muted small mt-2">Belum ada data bulan ini</div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          

        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;