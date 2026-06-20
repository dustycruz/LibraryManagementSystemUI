import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getMostBorrowed, getUserActivity, getAvailableBooks } from '../api/reportsApi';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
  const [activeTab, setActiveTab] = useState('most-borrowed');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setData(null);
      try {
        let res;
        if (activeTab === 'most-borrowed') res = await getMostBorrowed(10);
        else if (activeTab === 'user-activity') res = await getUserActivity();
        else if (activeTab === 'available') res = await getAvailableBooks();
        if (!cancelled) setData(res.data.data);
      } catch {
        if (!cancelled) toast.error('Failed to load report.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  const tabs = [
    { key: 'most-borrowed', label: 'Most Borrowed', icon: '📊' },
    { key: 'user-activity', label: 'User Activity', icon: '👥' },
    { key: 'available', label: 'Available Books', icon: '✅' },
  ];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>No data available.</div>;

    if (activeTab === 'most-borrowed') {
      const chartData = {
        labels: data.map(d => d.title.substring(0, 25)),
        datasets: [{
          label: 'Total Borrows',
          data: data.map(d => d.totalBorrows),
          backgroundColor: '#003f7f',
          borderRadius: 8,
          borderSkipped: false,
        }],
      };
      return (
        <div>
          <div style={{ marginBottom: '32px', height: '300px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Total Borrows: ${context.parsed.y}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } },
                  },
                  x: {
                    ticks: { font: { size: 12 } },
                  },
                },
              }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafb' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>#</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Title</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Author</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Category</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Total Borrows</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Available</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.bookId} style={{ borderBottom: '1px solid #e8eaed', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 63, 127, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>{i + 1}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{r.title}</td>
                    <td style={{ padding: '14px 16px' }}>{r.author}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.categoryName}</span></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#003f7f', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.totalBorrows}</span></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>{r.availableCopies}/{r.totalCopies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'user-activity') {
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafb' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Member</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Total</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Active</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Returned</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Total Fines</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Unpaid</th>
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.userId} style={{ borderBottom: '1px solid #e8eaed', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 63, 127, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600' }}>{r.memberName}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{r.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{r.totalBorrows}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#003f7f', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.activeBorrows}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.returnedBooks}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{formatCurrency(r.totalFines)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: r.unpaidFines > 0 ? '#ef4444' : '#6c757d', fontWeight: r.unpaidFines > 0 ? '700' : '600' }}>{formatCurrency(r.unpaidFines)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'available') {
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafb' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Title</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Author</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>ISBN</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Category</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Available</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.bookId} style={{ borderBottom: '1px solid #e8eaed', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 63, 127, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{r.title}</td>
                  <td style={{ padding: '14px 16px' }}>{r.author}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6c757d' }}>{r.isbn}</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.categoryName}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{r.availableCopies}</span></td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{r.totalCopies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '8px' }}>
          Reports & Analytics
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          View comprehensive library statistics and insights
        </p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
        overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e8eaed', backgroundColor: '#fafbfc' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#ffffff' : '#fafbfc',
                color: activeTab === tab.key ? '#003f7f' : '#6c757d',
                fontWeight: activeTab === tab.key ? '700' : '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderBottom: activeTab === tab.key ? '3px solid #003f7f' : 'none',
                marginBottom: activeTab === tab.key ? '-2px' : '0',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}