import { Navigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';

export default function SellerProtectedRoute({ children }) {
  const { isSellerAuthenticated } = useSeller();

  if (!isSellerAuthenticated) {
    return <Navigate to="/seller/login" replace />;
  }

  return children;
}

