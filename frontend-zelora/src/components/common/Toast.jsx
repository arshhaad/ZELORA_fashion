import { useCart } from '../../context/CartContext';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, setToast } = useCart();

  if (!toast) return null;

  return (
    <div className={`zelora-toast ${toast.type || 'success'}`}>
      <div className="toast-icon">
        {toast.type === 'error' && <AlertCircle size={18} />}
        {toast.type === 'warning' && <AlertCircle size={18} />}
        {toast.type === 'info' && <Info size={18} />}
        {(!toast.type || toast.type === 'success') && <Check size={18} />}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => setToast(null)}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

