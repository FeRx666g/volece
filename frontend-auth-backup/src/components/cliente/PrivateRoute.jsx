import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default PrivateRoute;