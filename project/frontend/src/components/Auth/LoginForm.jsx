import { useState, useRef, useEffect } from 'react';
import { FiUser, FiLock, FiLoader } from 'react-icons/fi';
import './Auth.css';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusField, setFocusField] = useState('');
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  const handleInputChange = (e, field) => {
    if (error) setError('');
    field === 'username' 
      ? setUsername(e.target.value) 
      : setPassword(e.target.value);
  };

  const handleFocus = (field) => {
    setFocusField(field);
  };

  const handleBlur = () => {
    setFocusField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка авторизации');
      }

      const data = await response.json();
      onLogin(data.token, data.role);
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Добро пожаловать</h2>
          <p>Введите ваши данные для входа</p>
        </div>

        {error && <div className="auth-error">
          <span>{error}</span>
        </div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className={`input-icon ${focusField === 'username' ? 'focused' : ''} ${error ? 'error' : ''}`} />
            <input
              ref={usernameRef}
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => handleInputChange(e, 'username')}
              onFocus={() => handleFocus('username')}
              onBlur={handleBlur}
              disabled={isLoading}
            />
            <div className="underline-container">
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="input-group">
            <FiLock className={`input-icon ${focusField === 'password' ? 'focused' : ''} ${error ? 'error' : ''}`} />
            <input
              ref={passwordRef}
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => handleInputChange(e, 'password')}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              disabled={isLoading}
            />
            <div className="underline-container">
              <div className="input-underline"></div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''} ${username && password ? 'active' : ''}`}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? <FiLoader className="spin" /> : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
