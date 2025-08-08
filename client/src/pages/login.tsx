import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const loginSchema = z.object({
  identifier: z.string().min(1, "Mobile number or email is required"),
  password: z.string().optional(),
  otp: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [displayedOtp, setDisplayedOtp] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const identifier = watch("identifier");

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
      return response;
    },
    onSuccess: (data) => {
      setShowOtpInput(true);
      // Display OTP from server response (temporary for testing)
      if (data.otp) {
        setDisplayedOtp(data.otp);
      }
      toast({
        title: "OTP Sent",
        description: "Please check your mobile and email for the OTP code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
          otp: otpValue || data.otp,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      // Store the tokens in localStorage
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.expiresIn) {
        localStorage.setItem('tokenExpiry', (Date.now() + data.expiresIn * 1000).toString());
      }

      // Update the auth cache immediately with user data
      if (data.user) {
        queryClient.setQueryData(["auth", "user"], data.user);
      }

      // Invalidate auth query to refresh user state
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Check if login response includes redirect path (for admin)
      if (data.redirectTo) {
        setTimeout(() => setLocation(data.redirectTo), 200);
      } else {
        // Redirect to home after login
        setTimeout(() => setLocation("/"), 200);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    if (loginMethod === "otp" && !showOtpInput) {
      sendOtpMutation.mutate();
    } else {
      loginMutation.mutate(data);
    }
  };

  const handleOtpComplete = (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      loginMutation.mutate({ identifier, otp: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-professional rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your secure vault</p>
            </div>

            <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "otp" | "password")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="otp">OTP Login</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="identifier">Mobile Number / Email</Label>
                  <Input
                    id="identifier"
                    {...register("identifier")}
                    placeholder="Enter mobile number or email"
                    className="mt-2"
                  />
                  {errors.identifier && (
                    <p className="text-sm text-red-600 mt-1">{errors.identifier.message}</p>
                  )}
                </div>

                <TabsContent value="otp" className="space-y-4">
                  {!showOtpInput ? (
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={sendOtpMutation.isPending || !identifier}
                    >
                      {sendOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {displayedOtp && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-yellow-800 font-medium">
                            🔒 Testing Mode - Your OTP: <span className="font-mono text-lg">{displayedOtp}</span>
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            (This will be removed in production)
                          </p>
                        </div>
                      )}
                      <div>
                        <Label>Enter OTP</Label>
                        <div className="flex justify-center mt-2">
                          <InputOTP 
                            maxLength={6} 
                            value={otpValue} 
                            onChange={setOtpValue}
                            onComplete={handleOtpComplete}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Didn't receive OTP?{" "}
                          <button 
                            type="button" 
                            onClick={() => sendOtpMutation.mutate()}
                            className="text-primary-500 hover:text-primary-600 font-medium"
                          >
                            Resend
                          </button>
                        </p>
                      </div>
                      <Button 
                        type="button"
                        className="w-full bg-green-500 hover:bg-green-600"
                        disabled={loginMutation.isPending || otpValue.length !== 6}
                        onClick={() => loginMutation.mutate({ identifier, otp: otpValue })}
                      >
                        {loginMutation.isPending ? "Verifying..." : "Verify & Login"}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="Enter your password"
                      className="mt-2"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </TabsContent>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{" "}
                <button
                  onClick={() => setLocation("/register/step1")}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Register here
                </button>
              </p>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
