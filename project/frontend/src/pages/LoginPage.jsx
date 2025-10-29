// src/pages/LoginPage.jsx
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    navigate('/dashboard/tso');
  };

  return (
    <div className="login-container">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}

export default LoginPage;