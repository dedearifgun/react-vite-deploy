import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Dropdown } from 'react-bootstrap';
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
  // Tema: adaptasi FinanceDash [data-theme="light"]
  const [theme, setTheme] = useState('dark');

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

  // Terapkan atribut data-theme pada root untuk switch tema
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <div className="admin-layout">
      <Helmet>
        <title>Admin Dashboard | Narpati Leather</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={`${window.location.origin}/admin`} />
      </Helmet>
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid className="app">
          {/* Topbar ala FinanceDash */}
          <div className="topbar">
            <div className="brand">
              <span className="text-muted" style={{ fontWeight: 600 }}>
                {quote ? `“${quote}”${quoteAuthor ? ` — ${quoteAuthor}` : ''}` : 'Memuat quote...'}
              </span>
            </div>
          <div className="actions">
              <div className="segmented seg-dropdown">
                <Dropdown>
                  <Dropdown.Toggle id="month-toggle" className="seg" variant="link">
                    {[
                      'Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'
                    ][selectedMonth]}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="start">
                    {[
                      'Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'
                    ].map((m, idx) => (
                      <Dropdown.Item
                        key={idx}
                        active={idx === selectedMonth}
                        onClick={() => setSelectedMonth(idx)}
                      >
                        {m}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="segmented seg-dropdown">
                <Dropdown>
                  <Dropdown.Toggle id="year-toggle" className="seg" variant="link">
                    {selectedYear}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="start">
                    {Array.from({ length: 5 }, (_, i) => nowInit.getFullYear() - i).map((y) => (
                      <Dropdown.Item
                        key={y}
                        active={y === selectedYear}
                        onClick={() => setSelectedYear(Number(y))}
                      >
                        {y}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <button className="btn" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} title="Toggle tema">
                {theme === 'dark' ? '☾' : '☀'}
              </button>
              <div className="text-muted small" style={{ whiteSpace: 'nowrap' }}>{currentTime || 'Memuat waktu...'}</div>
            </div>
          </div>

          {/* Grid utama ala FinanceDash */}
          <div className="grid">
            {/* KPI Grid */}
            <div className="kpis">
              <div className="kpi">
                <div className="kpi-label">Produk</div>
                <div className="kpi-value">{stats.totalProducts}</div>
                <div className="kpi-sub">Hari ini: {stats.todayProducts}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Kategori</div>
                <div className="kpi-value">{stats.totalCategories}</div>
                <div className="kpi-sub">Hari ini: {stats.todayCategories}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Chat WA Hari Ini</div>
                <div className="kpi-value">{stats.todayWaClicks}</div>
                <div className="kpi-sub">Bulan ini: {(() => {
                  const { counts } = buildMonthDailySeries(stats.dailyWaClicks, selectedYear, selectedMonth);
                  return counts.reduce((s, n) => s + (Number(n) || 0), 0);
                })()}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Log</div>
                <div className="kpi-value">{(() => {
                  const { counts } = buildMonthDailySeries(stats.dailyLogs, selectedYear, selectedMonth);
                  return counts.reduce((s, n) => s + (Number(n) || 0), 0);
                })()}</div>
                <div className="kpi-sub">Hari ini: {(() => {
                  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
                  const found = (stats.dailyLogs || []).find(d => d.date === todayStr);
                  return found ? Number(found.count || 0) : 0;
                })()}</div>
              </div>
            </div>

            {/* Chart 1: Produk Line (posisi grid-area: line) */}
            <div className="card chart-card">
              <div className="card-header">
                <h2>Produk Dibuat per Hari</h2>
                <div className="legend"><span className="dot" style={{ background: '#0d6efd' }}></span>Produk</div>
              </div>
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

            {/* Chart 2: Log Line (posisi grid-area: donut) */}
            <div className="card chart-card">
              <div className="card-header">
                <h2>Aktivitas Log per Hari</h2>
                <div className="legend"><span className="dot" style={{ background: '#6c757d' }}></span>Log</div>
              </div>
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

            {/* Chart 3: WA Line (posisi grid-area: bar) */}
            <div className="card chart-card">
              <div className="card-header">
                <h2>Chat WhatsApp per Hari</h2>
                <div className="legend"><span className="dot" style={{ background: '#ffc107' }}></span>WA Click</div>
              </div>
              {(() => {
                const { days, counts } = buildMonthDailySeries(stats.dailyWaClicks, selectedYear, selectedMonth);
                const total = counts.reduce((s, n) => s + (Number(n) || 0), 0);
                return (
                  <>
                    <LineChart
                      xAxis={[{ data: days, label: 'Tanggal', valueFormatter: (v) => String(v).padStart(2, '0') }]}
                      series={[{ label: 'Chat (WA)', data: counts, color: '#ffc107', curve: 'monotoneX', showMark: true }]}
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
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;