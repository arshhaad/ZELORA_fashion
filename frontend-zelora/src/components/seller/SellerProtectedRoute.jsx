import { Navigate, useLocation } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { useAuth } from '../../context/AuthContext';

export default function SellerProtectedRoute({ children }) {
  const { isSellerAuthenticated } = useSeller();
  const { user: customerUser } = useAuth();
  const location = useLocation();

  // Strict role check: Customers cannot access seller portal pages
  if (customerUser && !customerUser.is_seller) {
    return <Navigate to="/seller/login" state={{ from: location, error: 'Access restricted: Customers cannot access the Seller Atelier.' }} replace />;
  }

  if (!isSellerAuthenticated) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  return children;
}

