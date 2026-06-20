import { useAuth } from '../../context/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0 text-muted fw-normal" id="page-title" />
      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-primary">{user?.roles?.[0]}</span>
        <span className="text-muted small">{user?.email}</span>
      </div>
    </div>
  );
}