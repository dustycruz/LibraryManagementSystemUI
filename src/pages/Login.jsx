import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/useAuth';
import { login, register } from '../api/authApi';

// ── Reusable field component ──────────────────────────────────────────────────
function Field({ label, type = 'text', placeholder, value, onChange, error, hint }) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#ef4444'
    : focused
    ? '#003f7f'
    : '#e4e2e4';

  const shadow = focused
    ? error
      ? '0 0 0 3px rgba(239,68,68,0.12)'
      : '0 0 0 3px rgba(0,88,188,0.10)'
    : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#1b1b1d' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'inherit',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          backgroundColor: error ? '#fff8f8' : '#ffffff',
          color: '#1b1b1d',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: shadow,
        }}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#ef4444' }}>
          <span style={{ fontSize: 13 }}>⚠</span>
          {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11.5, color: '#717786' }}>{hint}</div>
      )}
    </div>
  );
}

// ── Submit button ─────────────────────────────────────────────────────────────
function SubmitBtn({ loading, label, loadingLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
style={{
  width: '100%',
  padding: '11px',
  backgroundColor: loading ? '#4d6f99' : hovered ? '#002f5f' : '#003f7f',
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.15s, transform 0.1s',
  transform: hovered && !loading ? 'translateY(-1px)' : 'none',
  boxShadow: loading ? 'none' : '0 2px 8px rgba(0,63,127,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,0.35)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Login() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Field-level errors
  const [loginErrors, setLoginErrors]       = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  // Server-level error banner
  const [serverError, setServerError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  // ── Clear field error on type ──
  const setLogin = (field, val) => {
    setLoginForm(f => ({ ...f, [field]: val }));
    if (loginErrors[field]) setLoginErrors(e => ({ ...e, [field]: '' }));
    setServerError('');
  };

  const setRegister = (field, val) => {
    setRegisterForm(f => ({ ...f, [field]: val }));
    if (registerErrors[field]) setRegisterErrors(e => ({ ...e, [field]: '' }));
    setServerError('');
  };

  // ── Validation ──
  const validateLogin = () => {
    const e = {};
    if (!loginForm.email)
      e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email))
      e.email = 'Enter a valid email address';
    if (!loginForm.password)
      e.password = 'Password is required';
    setLoginErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e = {};
    if (!registerForm.firstName.trim())
      e.firstName = 'First name is required';
    if (!registerForm.lastName.trim())
      e.lastName = 'Last name is required';
    if (!registerForm.email)
      e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email))
      e.email = 'Enter a valid email address';
    if (!registerForm.password)
      e.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(registerForm.password))
      e.password = 'Min. 8 characters — must include uppercase, lowercase, number, and special character';
    if (!registerForm.confirmPassword)
      e.confirmPassword = 'Please confirm your password';
    else if (registerForm.password !== registerForm.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setRegisterErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await login(loginForm);
      authLogin(res.data.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;

      if (!err.response) {
        setServerError('Cannot reach the server. Check your connection and try again.');
      } else if (status === 401) {
        // Don't expose which field is wrong — just highlight both
        setLoginErrors({
          email:    ' ',   // space = highlight without message
          password: ' ',
        });
        setServerError('Incorrect email or password. Please try again.');
      } else if (status === 403) {
        setServerError('Your account has been deactivated. Contact an administrator.');
      } else {
        setServerError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await register({
        firstName:       registerForm.firstName,
        lastName:        registerForm.lastName,
        email:           registerForm.email,
        password:        registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });
      toast.success('Account created! Please sign in.');
      setActiveTab('login');
      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;

      if (!err.response) {
        setServerError('Cannot reach the server. Check your connection and try again.');
      } else if (status === 400 && msg?.toLowerCase().includes('email')) {
        setRegisterErrors(prev => ({ ...prev, email: 'An account with this email already exists.' }));
      } else {
        setServerError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Tab switch ──
  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginErrors({});
    setRegisterErrors({});
    setServerError('');
  };

  // ── Field error counts for summary ──
  const loginErrCount    = Object.values(loginErrors).filter(v => v && v.trim()).length;
  const registerErrCount = Object.values(registerErrors).filter(v => v && v.trim()).length;

  return (
    <>
      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f7',
        padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 44, marginBottom: 12, lineHeight: 1 }}></div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#003f7f', margin: 0 }}>
              UST Angelicum
            </h1>
            <p style={{ fontSize: 13.5, color: '#717786', marginTop: 4 }}>
               Library Management System
            </p>
          </div>

          {/* Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e4e2e4' }}>
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    flex: 1,
                    padding: '14px 8px',
                    border: 'none',
                    background: activeTab === tab ? '#fff' : '#f6f3f5',
                    color: activeTab === tab ? '#003f7f' : '#717786',
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #003f7f' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 24px' }}>

              {/* ── Server error banner ── */}
              {serverError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 13,
                  color: '#991b1b',
                  lineHeight: 1.45,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🚫</span>
                  <span>{serverError}</span>
                </div>
              )}

              {/* ── Validation summary (multiple errors) ── */}
              {activeTab === 'login' && loginErrCount > 1 && !serverError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  marginBottom: 18,
                  fontSize: 12.5,
                  color: '#92400e',
                }}>
                  Please fix {loginErrCount} errors below before continuing.
                </div>
              )}

              {activeTab === 'register' && registerErrCount > 1 && !serverError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  marginBottom: 18,
                  fontSize: 12.5,
                  color: '#92400e',
                }}>
                  Please fix {registerErrCount} errors below before continuing.
                </div>
              )}

              {/* ══ LOGIN FORM ══ */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={loginForm.email}
                      onChange={e => setLogin('email', e.target.value)}
                      error={loginErrors.email?.trim() ? loginErrors.email : ''}
                    />
                    <Field
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => setLogin('password', e.target.value)}
                      error={loginErrors.password?.trim() ? loginErrors.password : ''}
                    />
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <SubmitBtn loading={loading} label="Sign In" loadingLabel="Signing in..." />
                  </div>
                </form>
              )}

              {/* ══ REGISTER FORM ══ */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field
                        label="First Name"
                        placeholder="John"
                        value={registerForm.firstName}
                        onChange={e => setRegister('firstName', e.target.value)}
                        error={registerErrors.firstName}
                      />
                      <Field
                        label="Last Name"
                        placeholder="Doe"
                        value={registerForm.lastName}
                        onChange={e => setRegister('lastName', e.target.value)}
                        error={registerErrors.lastName}
                      />
                    </div>
                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={registerForm.email}
                      onChange={e => setRegister('email', e.target.value)}
                      error={registerErrors.email}
                    />
                    <Field
                      label="Password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={registerForm.password}
                      onChange={e => setRegister('password', e.target.value)}
                      error={registerErrors.password}
                      hint="Must include uppercase, lowercase, number, and special character"
                    />
                    <Field
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={registerForm.confirmPassword}
                      onChange={e => setRegister('confirmPassword', e.target.value)}
                      error={registerErrors.confirmPassword}
                    />
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <SubmitBtn loading={loading} label="Create Account" loadingLabel="Creating account..." />
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#717786' }}>
            © 2026 Library Management System · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}