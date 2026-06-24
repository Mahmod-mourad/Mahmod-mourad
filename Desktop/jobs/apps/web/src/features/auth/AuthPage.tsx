import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, LoginSchema } from '@nexahire/types';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      if (isLogin) {
        await login.mutateAsync(data);
        navigate('/');
      } else {
        await register.mutateAsync(data);
        setIsLogin(true); // Switch to login after register
      }
    } catch (err: any) {
      console.error('Auth error', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? 'Log in to NexaHire' : 'Create an Account'}</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" {...formRegister('email')} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" {...formRegister('password')} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {(login.isError || register.isError) && (
            <div className="error-banner">
              {login.error?.message || register.error?.message || 'Authentication failed'}
            </div>
          )}

          <button type="submit" disabled={login.isPending || register.isPending}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
