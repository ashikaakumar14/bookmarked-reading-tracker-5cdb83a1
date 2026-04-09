import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Dashboard />
      <BottomNav />
    </>
  );
};

export default Index;
