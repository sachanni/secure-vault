import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RegistrationProgress } from "@/components/ui/registration-progress";
import { Shield, Lock, Eye, EyeOff, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const step2Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, "Please agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step2FormData = z.infer<typeof step2Schema>;

export default function RegistrationStep2() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [step1Data, setStep1Data] = useState<any>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const password = watch("password");

  // Get step 1 data from session storage with better error handling
  useEffect(() => {
    try {
      const step1DataString = sessionStorage.getItem('registrationStep1');
      const tempId = sessionStorage.getItem('registrationTempId');
      
      if (step1DataString && tempId) {
        const data = JSON.parse(step1DataString);
        setStep1Data(data);
        console.log('Step 1 data loaded successfully:', data);
        console.log('Registration tempId:', tempId);
      } else {
        console.log('Missing step 1 data or tempId, redirecting to step 1');
        toast({
          title: "Session Error",
          description: "Registration session expired. Please start again.",
          variant: "destructive",
        });
        setLocation('/register/step1');
      }
    } catch (error) {
      console.error('Error loading step 1 data:', error);
      toast({
        title: "Session Error", 
        description: "Registration session corrupted. Please start again.",
        variant: "destructive",
      });
      setLocation('/register/step1');
    }
  }, [setLocation, toast]);

  const passwordRequirements = [
    { met: password?.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password || ""), text: "One uppercase letter" },
    { met: /[0-9]/.test(password || ""), text: "One number" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      const tempId = sessionStorage.getItem('registrationTempId');
      if (!tempId) {
        throw new Error("Registration session expired. Please start again from step 1.");
      }
      
      console.log('Sending registration step 2 with tempId:', tempId);
      const response = await apiRequest("/api/register/step2", {
        method: "POST",
        body: JSON.stringify({
          tempId,
          email: data.email,
          password: data.password,
        }),
      });
      
      console.log('Registration step 2 response:', response);
      return response;
    },
    onSuccess: (data) => {
      // Clear session storage
      sessionStorage.removeItem('registrationStep1');
      sessionStorage.removeItem('registrationTempId');
      
      // Store the authentication tokens
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiry', (Date.now() + data.expiresIn * 1000).toString());
      }
      
      // Update the auth cache with the user data
      if (data.user) {
        queryClient.setQueryData(["auth", "user"], data.user);
      }
      
      // Invalidate auth queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      toast({
        title: "Account Created!",
        description: "Welcome to the Posthumous Notification System.",
      });
      
      // Navigate to dashboard after successful registration
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Step2FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Progress Bar */}
        <RegistrationProgress 
          currentStep={2} 
          totalSteps={2} 
          stepTitle="Security Setup" 
        />

        {/* Step 1 Information Display */}
        {step1Data && (
          <Card className="mb-6 bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Step 1 Information:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">Name:</span> {step1Data.fullName}</div>
                <div><span className="font-medium">Username:</span> {step1Data.fullName?.toLowerCase().replace(/\s+/g, '')}</div>
                <div><span className="font-medium">Phone:</span> {step1Data.countryCode}{step1Data.mobileNumber}</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 mt-2">Complete your registration with email and password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className="mt-2"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Create a strong password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                    </div>
                  ))}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className="mt-2"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>



              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-5">
                  I agree to the{" "}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation("/register/step1")}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
