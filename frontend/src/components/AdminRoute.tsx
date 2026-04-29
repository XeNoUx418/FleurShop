import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  role: string;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (payload.role !== 'admin') return <Navigate to="/shop" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}