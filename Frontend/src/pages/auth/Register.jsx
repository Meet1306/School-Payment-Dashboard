import { Link, useNavigate } from 'react-router-dom'; // Added Link import
import AuthLayout from '../../components/auth/AuthLayout';
import AuthForm from '../../components/auth/AuthForm';
import { registerUser } from '../../services/auth';

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      await registerUser(userData);
      // Redirect to login after successful registration
      navigate('/login');
    } catch (error) {
      throw error; // Let AuthForm handle the error
    }
  };

  return (
    <AuthLayout
      title="Create a new account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm isLogin={false} onSubmit={handleRegister} />
    </AuthLayout>
  );
};

export default Register;