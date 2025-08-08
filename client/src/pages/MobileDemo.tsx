import React, { useState, useEffect } from 'react';

export default function MobileDemo() {
  const [activeTab, setActiveTab] = useState('otp');
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const mockSocialLogin = (provider: string) => {
    setSimulatedLoading(true);
    setErrorMessage('');
    
    // Simulate authentication delay
    setTimeout(() => {
      setSimulatedLoading(false);
      setCurrentScreen('dashboard');
    }, 2000);
  };

  const mockLogin = () => {
    setSimulatedLoading(true);
    setErrorMessage('');
    
    // Simulate authentication delay
    setTimeout(() => {
      setSimulatedLoading(false);
      setCurrentScreen('dashboard');
    }, 1500);
  };

  const mockLoginError = () => {
    setSimulatedLoading(true);
    setErrorMessage('');
    
    setTimeout(() => {
      setSimulatedLoading(false);
      setErrorMessage('Invalid credentials. Please try again.');
    }, 1000);
  };

  const LoginScreen = () => (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-100">Sign in to your account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          {/* Tab Selector */}
          <div className="flex mb-6 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'otp'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white/80'
              }`}
            >
              📱 OTP Login
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white/80'
              }`}
            >
              🔐 Password
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email or Mobile Number"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {activeTab === 'password' ? (
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="mt-2 text-sm text-white/80 hover:text-white">
                  📨 Send OTP
                </button>
              </div>
            )}

            <button
              onClick={mockLogin}
              disabled={simulatedLoading}
              className={`w-full py-3 bg-gradient-to-r from-white/20 to-white/10 border border-white/30 rounded-xl text-white font-medium hover:from-white/30 hover:to-white/20 transition-all flex items-center justify-center gap-2 ${
                simulatedLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {simulatedLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Error Display */}
            {errorMessage && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-200 text-sm text-center">{errorMessage}</p>
              </div>
            )}

            {/* Demo Features */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={mockLoginError}
                className="flex-1 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-xs font-medium hover:bg-yellow-500/30 transition-all"
              >
                Test Error
              </button>
              <button
                onClick={() => {
                  setErrorMessage('');
                  setActiveTab(activeTab === 'otp' ? 'password' : 'otp');
                }}
                className="flex-1 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 text-xs font-medium hover:bg-purple-500/30 transition-all"
              >
                Switch Tab
              </button>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-sm text-white/60">Or continue with</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => mockSocialLogin('Google')}
                disabled={simulatedLoading}
                className={`flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2 ${
                  simulatedLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {simulatedLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '🔍'
                )}
                Google
              </button>
              <button
                onClick={() => mockSocialLogin('Apple')}
                disabled={simulatedLoading}
                className={`flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2 ${
                  simulatedLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {simulatedLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '🍎'
                )}
                Apple
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentScreen('register')}
              className="text-sm text-white/80 hover:text-white"
            >
              Don't have an account? <span className="underline">Create Account</span>
            </button>
          </div>

          {/* Security Features */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center text-xs text-white/60">
              <span className="mr-2">🛡️</span>
              End-to-End Encryption
            </div>
            <div className="flex items-center text-xs text-white/60">
              <span className="mr-2">🔐</span>
              Zero-Knowledge Architecture
            </div>
            <div className="flex items-center text-xs text-white/60">
              <span className="mr-2">⚡</span>
              Instant Secure Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardScreen = () => (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-purple-100">Welcome to your secure account</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-2">📊 Account Overview</h3>
            <p className="text-white/80 text-sm">Social login successful!</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-2">🔐 Security Status</h3>
            <p className="text-white/80 text-sm">All systems secure</p>
          </div>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full py-3 bg-gradient-to-r from-white/20 to-white/10 border border-white/30 rounded-xl text-white font-medium hover:from-white/30 hover:to-white/20 transition-all"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-demo-container">
      <div className="text-center py-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 Mobile App Demo</h1>
        <p className="text-gray-600">Interactive preview of React Native authentication screens</p>
        
        {/* Notice about React Native */}
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="text-left">
              <h3 className="font-semibold text-blue-800 mb-1">About the Mobile App</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                The React Native mobile app code is available in the <code className="bg-blue-100 px-1 rounded">mobile/</code> folder. 
                However, React Native apps cannot run directly in Replit's web environment. This demo shows how the mobile authentication screens would look and behave.
              </p>
              <div className="mt-2 text-xs text-blue-600 space-y-1">
                <div><strong>Local Setup:</strong> Download mobile folder → npm install → expo start</div>
                <div><strong>Online Testing:</strong> Copy code to snack.expo.dev for instant testing</div>
                <div><strong>Current Demo:</strong> Shows exactly how the mobile app works</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${currentScreen === 'login' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
            Login Screen
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${currentScreen === 'dashboard' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
            Dashboard
          </span>
        </div>
      </div>
      
      <div className="max-w-sm mx-auto border-8 border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl bg-black">
        <div className="h-6 bg-black flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
        </div>
        
        {currentScreen === 'login' && <LoginScreen />}
        {currentScreen === 'dashboard' && <DashboardScreen />}
      </div>
    </div>
  );
}