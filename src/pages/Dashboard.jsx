import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getDashboardStats,
  getMostBorrowed,
  getUserActivity,
} from '../api/reportsApi';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Activity,
  Flame,
  ArrowUp
} from 'lucide-react';

const BLUE = '#003f7f';
const CARD = { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)', overflow: 'hidden' };
const PILL = (bg) => ({ display: 'inline-block', padding: '4px 10px', backgroundColor: bg, color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '600' });

const ADMIN_STATS = [
  { key: 'totalBooks',           label: 'Total Books',      Icon: BookOpen, bg: 'linear-gradient(135deg, #e8f0fe 0%, #c7d9f5 100%)', color: '#1a73e8' },
  { key: 'totalAvailableCopies', label: 'Available Copies', Icon: CheckCircle, bg: 'linear-gradient(135deg, #e6f4ea 0%, #b7e4c7 100%)', color: '#137333' },
  { key: 'activeBorrows',        label: 'Active Borrows',   Icon: TrendingUp, bg: 'linear-gradient(135deg, #e3f9ff 0%, #b3e5fc 100%)', color: '#0277bd' },
  { key: 'overdueCount',         label: 'Overdue',          Icon: AlertCircle, bg: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)', color: '#f57f17' },
  { key: 'totalActiveUsers',     label: 'Active Users',     Icon: Users, bg: 'linear-gradient(135deg, #f3e8fd 0%, #e1bee7 100%)', color: '#7b1fa2' },
  { key: 'totalUnpaidFines',     label: 'Unpaid Fines',     Icon: DollarSign, bg: 'linear-gradient(135deg, #fce8e6 0%, #ffcccc 100%)', color: '#c5221f', format: formatCurrency },
];

export default function Dashboard() {
  const { isAdminOrLibrarian } = useAuth();

  const [stats, setStats]               = useState(null);
  const [topBooks, setTopBooks]         = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setTopBooks([]);
      try {
        const [statsRes, booksRes] = await Promise.all([
          getDashboardStats(),
          getMostBorrowed(10),
        ]);
        setStats(statsRes.data.data);
        setTimeout(() => setTopBooks(booksRes.data.data), 50);

        if (isAdminOrLibrarian()) {
          try {
            const activityRes = await getUserActivity();
            setUserActivity(activityRes.data.data);
          } catch (err) {
            console.error('Failed to load user activity:', err);
            setUserActivity([]);
          }
        }
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdminOrLibrarian]);

  if (!isAdminOrLibrarian()) {
    // MEMBER VIEW - Trending Books Only
    return (
      <div style={{ backgroundColor: '#f8fafb', minHeight: '100vh', paddingBottom: '32px' }}>
        <div style={{ marginBottom: '32px', paddingTop: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: BLUE, marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '15px', color: '#6c757d', margin: 0 }}>
            Discover trending books in your library
          </p>
        </div>

        <div style={{ ...CARD, border: '1px solid rgba(0, 63, 127, 0.06)' }}>
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '24px', 
            borderBottom: '2px solid #f0f2f5',
            backgroundColor: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
          }}>
            <Flame size={20} color={BLUE} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: BLUE, margin: 0 }}>
              Trending Books
            </h2>
          </div>

          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <LoadingSpinner />
              </div>
            ) : topBooks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topBooks.map((book, idx) => (
                  <div
                    key={book.bookId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e8eaed',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#f0f4f8';
                      e.currentTarget.style.borderColor = '#c0c8d8';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e8eaed';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' 
                                  : idx === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)'
                                  : idx === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #e8a76b 100%)'
                                  : 'linear-gradient(135deg, #e8f0fe 0%, #c7d9f5 100%)',
                      color: idx <= 2 ? '#000' : BLUE,
                      fontWeight: '800',
                      fontSize: '20px',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}>
                      {idx + 1}
                    </div>

                    {/* Book Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {book.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#6c757d',
                        margin: '0 0 6px 0',
                      }}>
                        by {book.author}
                      </p>
                      <div style={{
                        fontSize: '12px',
                        display: 'inline-block',
                        padding: '3px 8px',
                        backgroundColor: '#e8f0fe',
                        color: BLUE,
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}>
                        {book.categoryName}
                      </div>
                    </div>

                    {/* Borrow Count */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      padding: '0 12px',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: BLUE,
                      }}>
                        {book.totalBorrows}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        fontWeight: '600',
                      }}>
                        Borrows
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#e6f4ea',
                      flexShrink: 0,
                    }}>
                      <ArrowUp size={18} color="#10b981" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6c757d' }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontSize: '14px', fontWeight: '500' }}>No trending books yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN/LIBRARIAN VIEW - Full Dashboard
  return (
    <div style={{ backgroundColor: '#f8fafb', minHeight: '100vh', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '32px', paddingTop: '8px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: BLUE, marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '15px', color: '#6c757d', margin: 0 }}>
          Welcome back! Here's an overview of your library activity
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {ADMIN_STATS.map(({ key, label, Icon, bg, format }) => {
            const raw   = stats[key] ?? 0;
            const value = format ? format(raw) : raw;
            return (
              <div
                key={key}
                style={{
                  ...CARD,
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'default',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 63, 127, 0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 63, 127, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 63, 127, 0.12)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: bg,
                  opacity: 0.1,
                  zIndex: 0,
                }} />

                <div style={{
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px',
                  background: bg,
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center', 
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: '0 4px 12px rgba(0, 63, 127, 0.1)',
                }}>
                  <Icon size={28} color={label === 'Unpaid Fines' ? '#c5221f' : label === 'Active Users' ? '#7b1fa2' : label === 'Overdue' ? '#f57f17' : label === 'Active Borrows' ? '#0277bd' : label === 'Available Copies' ? '#137333' : '#1a73e8'} />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: BLUE, lineHeight: 1, marginBottom: '4px' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: '500' }}>
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '24px',
        minHeight: '600px',
      }}>

        {/* ── TRENDING BOOKS CARD ── */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 63, 127, 0.06)' }}>
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '24px', 
            borderBottom: '2px solid #f0f2f5',
            backgroundColor: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
            flexShrink: 0,
          }}>
            <Flame size={20} color={BLUE} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: BLUE, margin: 0 }}>
              Trending Books
            </h2>
          </div>

          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
                <LoadingSpinner />
              </div>
            ) : topBooks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topBooks.map((book, idx) => (
                  <div
                    key={book.bookId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e8eaed',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#f0f4f8';
                      e.currentTarget.style.borderColor = '#c0c8d8';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e8eaed';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Rank Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' 
                                  : idx === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)'
                                  : idx === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #e8a76b 100%)'
                                  : 'linear-gradient(135deg, #e8f0fe 0%, #c7d9f5 100%)',
                      color: idx <= 2 ? '#000' : BLUE,
                      fontWeight: '800',
                      fontSize: '20px',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}>
                      {idx + 1}
                    </div>

                    {/* Book Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {book.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#6c757d',
                        margin: '0 0 6px 0',
                      }}>
                        by {book.author}
                      </p>
                      <div style={{
                        fontSize: '12px',
                        display: 'inline-block',
                        padding: '3px 8px',
                        backgroundColor: '#e8f0fe',
                        color: BLUE,
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}>
                        {book.categoryName}
                      </div>
                    </div>

                    {/* Borrow Count */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      padding: '0 12px',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: BLUE,
                      }}>
                        {book.totalBorrows}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        fontWeight: '600',
                      }}>
                        Borrows
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#e6f4ea',
                      flexShrink: 0,
                    }}>
                      <ArrowUp size={18} color="#10b981" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d' }}>No trending books yet.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── USER ACTIVITY CARD ── */}
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 63, 127, 0.06)' }}>
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '24px', 
            borderBottom: '2px solid #f0f2f5',
            backgroundColor: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
          }}>
            <Activity size={20} color={BLUE} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: BLUE, margin: 0 }}>
              Recent User Activity
            </h2>
          </div>

          <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {userActivity?.length > 0 ? (
              userActivity.slice(0, 12).map((u, idx) => (
                <div
                  key={u.userId}
                  style={{
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    transition: 'all 0.2s',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 63, 127, 0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${['#c7d9f5', '#ddd0f9', '#f0d9f5', '#d9e7f5'][idx % 4]} 0%, ${['#ddd0f9', '#f0d9f5', '#d9e7f5', '#c7d9f5'][idx % 4]} 100%)`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '13px', 
                    fontWeight: '700', 
                    color: BLUE, 
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 63, 127, 0.1)',
                  }}>
                    {u.memberName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#212529', marginBottom: '2px' }}>
                      {u.memberName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                      {u.email}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={PILL('#10b981')}>✔ {u.returnedBooks}</span>
                      {u.unpaidFines > 0 && (
                        <span style={PILL('#ef4444')}>💰 {formatCurrency(u.unpaidFines)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
                <Users size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div style={{ fontSize: '13px' }}>No activity yet.</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}