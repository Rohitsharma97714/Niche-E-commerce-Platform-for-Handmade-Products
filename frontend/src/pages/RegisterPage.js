import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../index.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const getPasswordError = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must include at least one number.';
    if (!/[\W_]/.test(password)) return 'Password must include at least one special character.';
    return '';
  };

  const handleSendOtp = async () => {
  const passwordError = getPasswordError(form.password);
  if (passwordError) {
    toast.error(passwordError);
    return;
  }

  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/otp/send-email-otp`, { email: form.email });
    toast.success('OTP sent to your email');
    // ⏳ Wait briefly to ensure toast shows
    setTimeout(() => setStep(2), 300);
  } catch (err) {
    if (err.response?.data?.error) {
      toast.error(err.response.data.error);  // e.g., "Email already exists"
    } else {
      toast.error('Failed to send OTP');
    }
  }
};

  const handleVerifyOtp = async () => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/otp/verify-email-otp`, {
      email: form.email,
      otp
    });

    if (res.data.verified) {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);
      toast.success('Registration successful!');
      // ⏳ Delay navigation to show toast
      setTimeout(() => navigate('/login'), 2000);
    } else {
      toast.error('Invalid OTP');
      setTimeout(() => {
        setOtp('');
        setStep(1);
      }, 500); // Wait a bit to let toast show
    }
  } catch (err) {
    console.error(err);
    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error('Verification failed');
    }

    // Restore input after toast
    setTimeout(() => {
      setOtp('');
      setStep(1);
    }, 500);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 text-center mb-2">Create an Account ✨</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">Register to explore Desi-Etsy</p>

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOtp();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-lg"
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            {form.password && getPasswordError(form.password) && (
              <p className="text-sm text-red-600 dark:text-red-400">{getPasswordError(form.password)}</p>
            )}

            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="customer">Customer</option>
              <option value="artisan">Artisan</option>
            </select>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition"
            >
              Register
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP sent to email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition"
            >
              Verify & Create Account
            </button>
          </div>
        )}

        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;