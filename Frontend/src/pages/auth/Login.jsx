import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { loginUser as apiLogin } from '../../services/auth';

const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      login(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  if (token) {
    return null;
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </>
      }
    >
      <AuthForm isLogin={true} onSubmit={handleLogin} />
    </AuthLayout>
  );
};

export default Login;