import { Navigate, useLocation } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';

export default function SellerProtectedRoute({ children }) {
  const { isSellerAuthenticated } = useSeller();
  const location = useLocation();

  if (!isSellerAuthenticated) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  return children;
}

