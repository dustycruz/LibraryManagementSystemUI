export default function LoadingSpinner({ size = 'md' }) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <div
          className={`spinner-border text-primary spinner-border-${size}`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }