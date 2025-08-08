import React, { useState } from 'react';

export default function BiometricDemo() {
  const [currentScreen, setCurrentScreen] = useState<'selection' | 'fingerprint' | 'faceId'>('selection');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const startFingerprint = () => {
    setCurrentScreen('fingerprint');
    setScanState('scanning');
    
    // Simulate scanning process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setScanState('success');
        setTimeout(() => {
          setCurrentScreen('selection');
          setScanState('idle');
          setProgress(0);
        }, 2000);
      }
    }, 200);
  };

  const startFaceId = () => {
    setCurrentScreen('faceId');
    setScanState('scanning');
    
    // Simulate scanning process
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        setCurrentScreen('selection');
        setScanState('idle');
        setProgress(0);
      }, 2000);
    }, 3000);
  };

  const BiometricSelection = () => (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-3xl">🛡️</span>
            </div>
            <div className="absolute -inset-2 bg-white/10 rounded-full -z-10"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Biometric Authentication</h1>
          <p className="text-purple-100">Choose your preferred method</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={startFingerprint}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👆</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold text-lg">Fingerprint</h3>
                <p className="text-white/80 text-sm">Quick and secure access</p>
              </div>
              <span className="text-white/60 text-xl">→</span>
            </div>
          </button>

          <button
            onClick={startFaceId}
            className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
          >
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold text-lg">Face ID</h3>
                <p className="text-white/80 text-sm">Hands-free authentication</p>
              </div>
              <span className="text-white/60 text-xl">→</span>
            </div>
          </button>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4 text-center">🔐 Biometric Security</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-lg mr-3">🚀</span>
              <span className="text-white/90">Lightning Fast Access</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-3">🛡️</span>
              <span className="text-white/90">Military-Grade Encryption</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-3">📱</span>
              <span className="text-white/90">Device-Local Authentication</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-3">🔒</span>
              <span className="text-white/90">Zero Data Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FingerprintScanner = () => (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 min-h-screen p-4 flex flex-col">
      <div className="max-w-md mx-auto flex-1 flex flex-col justify-between">
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">Fingerprint Scanner</h1>
          <p className="text-purple-100">Touch the sensor to authenticate</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            {/* Scanning rings */}
            {scanState === 'scanning' && (
              <>
                <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-2 border-white/20 rounded-full animate-pulse"></div>
              </>
            )}
            
            {/* Main fingerprint icon */}
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              scanState === 'scanning' ? 'border-white bg-white/20 scale-110' :
              scanState === 'success' ? 'border-green-400 bg-green-400/20' :
              scanState === 'error' ? 'border-red-400 bg-red-400/20' :
              'border-white/50 bg-white/10'
            }`}>
              <span className={`text-4xl transition-all duration-300 ${
                scanState === 'success' ? 'scale-125' : ''
              }`}>
                {scanState === 'success' ? '✓' : scanState === 'error' ? '✕' : '👆'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-lg font-semibold mb-2 ${
              scanState === 'error' ? 'text-red-300' :
              scanState === 'success' ? 'text-green-300' :
              'text-white'
            }`}>
              {scanState === 'idle' && 'Touch the sensor to authenticate'}
              {scanState === 'scanning' && 'Keep your finger on the sensor...'}
              {scanState === 'success' && 'Authentication successful!'}
              {scanState === 'error' && 'Authentication failed'}
            </p>
            <p className="text-white/70">
              {scanState === 'scanning' && `${Math.round(progress)}% complete`}
              {scanState === 'success' && 'Welcome back!'}
              {scanState === 'error' && 'Please try again'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCurrentScreen('selection')}
            className="w-full py-3 text-white/80 underline"
          >
            Back to Selection
          </button>
        </div>
      </div>
    </div>
  );

  const FaceIdScanner = () => (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-500 min-h-screen p-4 flex flex-col">
      <div className="max-w-md mx-auto flex-1 flex flex-col justify-between">
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">Face ID Scanner</h1>
          <p className="text-purple-100">Look at the camera to authenticate</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Face scanning frame */}
          <div className="relative w-48 h-60 mb-8">
            {/* Frame corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
            
            {/* Scanning animation */}
            {scanState === 'scanning' && (
              <div className="absolute inset-0 border-2 border-white/30 animate-pulse">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-bounce"></div>
              </div>
            )}
            
            {/* Face icon */}
            <div className={`absolute inset-0 flex items-center justify-center text-6xl transition-all duration-500 ${
              scanState === 'success' ? 'text-green-400 scale-110' :
              scanState === 'error' ? 'text-red-400' :
              'text-white'
            }`}>
              {scanState === 'success' ? '✓' : scanState === 'error' ? '✕' : '👤'}
            </div>
          </div>

          {/* Progress bar */}
          {scanState === 'scanning' && (
            <div className="w-48 h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-green-400 transition-all duration-300 ease-out"
                style={{ width: `${(Date.now() % 3000) / 30}%` }}
              ></div>
            </div>
          )}

          <div className="text-center">
            <p className={`text-lg font-semibold mb-2 ${
              scanState === 'error' ? 'text-red-300' :
              scanState === 'success' ? 'text-green-300' :
              'text-white'
            }`}>
              {scanState === 'idle' && 'Position your face in the frame'}
              {scanState === 'scanning' && 'Scanning your face...'}
              {scanState === 'success' && 'Face ID authentication successful!'}
              {scanState === 'error' && 'Face ID authentication failed'}
            </p>
            <p className="text-white/70">
              {scanState === 'scanning' && 'Hold still'}
              {scanState === 'success' && 'Welcome back!'}
              {scanState === 'error' && 'Please try again'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCurrentScreen('selection')}
            className="w-full py-3 text-white/80 underline"
          >
            Back to Selection
          </button>
        </div>

        {/* Camera indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`w-2 h-2 rounded-full ${
            scanState === 'scanning' ? 'bg-orange-400' :
            scanState === 'success' ? 'bg-green-400' :
            scanState === 'error' ? 'bg-red-400' :
            'bg-white/30'
          }`}></div>
          <span className="text-xs text-white/60">📹 Camera Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-demo-container">
      <div className="text-center py-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🔒 Biometric Login Demo</h1>
        <p className="text-gray-600">Interactive preview of biometric authentication screens</p>
        
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="text-left">
              <h3 className="font-semibold text-blue-800 mb-1">About Biometric Authentication</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                This demo showcases advanced biometric login animations including fingerprint and Face ID scanning. 
                The animations simulate real biometric authentication with progress indicators, success/error states, and smooth transitions.
              </p>
              <div className="mt-2 text-xs text-blue-600 space-y-1">
                <div><strong>Features:</strong> Animated scanning, progress tracking, vibration feedback</div>
                <div><strong>Security:</strong> Device-local authentication, zero data storage</div>
                <div><strong>Demo:</strong> Interactive biometric scanning simulation</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${currentScreen === 'selection' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
            Selection
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${currentScreen === 'fingerprint' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
            Fingerprint
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${currentScreen === 'faceId' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
            Face ID
          </span>
        </div>
      </div>
      
      <div className="max-w-sm mx-auto border-8 border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl bg-black">
        <div className="h-6 bg-black flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
        </div>
        
        {currentScreen === 'selection' && <BiometricSelection />}
        {currentScreen === 'fingerprint' && <FingerprintScanner />}
        {currentScreen === 'faceId' && <FaceIdScanner />}
      </div>
    </div>
  );
}