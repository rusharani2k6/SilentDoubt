import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doLogin = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const u = await login(email, password);

      if (u.role === 'admin') {
        navigate('/admin/users');
      } else if (u.role === 'faculty') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden sd-hero-bg">

      {/* =========================
          SOFT BACKGROUND BLOBS
      ========================== */}

      <div
        className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(246,228,159,0.35) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(155,229,227,0.30) 0%, transparent 70%)',
        }}
      />

      {/* =========================
          LOGO + TITLE
      ========================== */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">

        {/* SD Logo + Silent Doubt */}
        <div className="flex justify-center items-center mb-4">

          {/* SD LOGO */}
          <div
            className="
              w-10 h-10
              rounded-xl
              flex items-center justify-center
              font-extrabold
              text-[15px]
              text-[#0D0F0D]
              shadow-sm
            "
            style={{
              background:
                'linear-gradient(135deg, #F6E49F 0%, #9BE5E3 100%)',
            }}
          >
            SD
          </div>

          {/* Silent Doubt */}
          <span className="ml-2.5 text-[15px] font-semibold text-[#0D0F0D]">
            Silent Doubt
          </span>

        </div>

        {/* Page Heading */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D0F0D] tracking-tight">
          Sign in to your classroom
        </h2>

        {/* Description */}
        <p className="mt-1.5 text-xs text-[#3D3F4A]">
          Submit silent doubts, vote in live polls, and track your
          real-time comprehension
        </p>
      </div>

      {/* =========================
          LOGIN CARD
      ========================== */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <div className="bg-white py-8 px-6 sm:px-10 shadow-sd-xl border border-[#E4E8EE] rounded-4xl">

          {/* =========================
              ERROR MESSAGE
          ========================== */}

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">

              <AlertCircle className="w-4 h-4 flex-shrink-0" />

              <span>{error}</span>

            </div>
          )}

          {/* =========================
              LOGIN FORM
          ========================== */}

          <form onSubmit={doLogin} className="space-y-4">

            {/* Email */}
            <Input
              id="login-email"
              type="email"
              label="Institutional Email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@silentdoubt.edu"
            />

            {/* Password */}
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              required
              icon={Lock}
              iconRight={showPassword ? EyeOff : Eye}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onClickIconRight={() =>
                setShowPassword(!showPassword)
              }
            />

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 font-bold"
              iconRight={ArrowRight}
            >
              Sign In
            </Button>

          </form>

        </div>
      </div>

    </div>
  );
};