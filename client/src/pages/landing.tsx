import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Coins, Heart, Users, Lock, ShieldQuestion, CloudUpload } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  // Component renders only once - duplication must be CSS-related

  return (
    <div className="min-h-screen" id="landing-page" key="landing-unique">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50" id="main-navigation" data-header="unique">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-professional rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WellnessLegacy</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className="text-primary-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Wellness</a>
                <a href="#security" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Legacy</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/login")}>
                Login
              </Button>
              <Button onClick={() => setLocation("/register/step1")}>
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-professional text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Digital Wellness & Legacy Protection</h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-100 max-w-3xl mx-auto">
              Monitor your wellness, track your mood, and ensure your digital assets reach your loved ones with our comprehensive wellness platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setLocation("/register/step1")}
                className="bg-white text-slate-700 hover:bg-gray-100"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-700"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Wellness Monitoring & Legacy Protection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your daily wellness, monitor your mood, and ensure your digital legacy reaches your loved ones when needed
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Asset Management</h3>
                <p className="text-gray-600">
                  Securely store information about bank accounts, investments, real estate, cryptocurrency, and other valuable assets
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mood & Wellness Tracking</h3>
                <p className="text-gray-600">
                  Daily mood logging with 12 emotional states, wellness analytics, and configurable check-in alerts
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nominee Management</h3>
                <p className="text-gray-600">
                  Designate trusted contacts who will receive asset information through our secure validation process
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Bank-Level Security</h2>
              <p className="text-lg text-gray-600 mb-8">
                Your sensitive information is protected with enterprise-grade encryption and security measures
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">End-to-End Encryption</h4>
                    <p className="text-gray-600">All data encrypted during storage and transmission</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ShieldQuestion className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Factor Authentication</h4>
                    <p className="text-gray-600">OTP verification via mobile and email</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CloudUpload className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Storage Options</h4>
                    <p className="text-gray-600">Google Drive, DigiLocker, or local server storage</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Account Security</span>
                    </div>
                    <span className="text-green-600 text-sm font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Data Encryption</span>
                    </div>
                    <span className="text-green-600 text-sm font-semibold">256-bit AES</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldQuestion className="w-4 h-4 text-green-500" />
                      <span className="font-medium">2FA Enabled</span>
                    </div>
                    <span className="text-green-600 text-sm font-semibold">SMS + Email</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
