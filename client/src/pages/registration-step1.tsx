import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrationProgress } from "@/components/ui/registration-progress";
import { UserPlus, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  countryCode: z.string().default("+91"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
});

type Step1FormData = z.infer<typeof step1Schema>;

export default function RegistrationStep1() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      countryCode: "+91",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Step1FormData) => {
      const response = await apiRequest("/api/register/step1", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Save step 1 data and tempId to session storage for step 2
      sessionStorage.setItem('registrationStep1', JSON.stringify(variables));
      sessionStorage.setItem('registrationTempId', data.tempId);
      
      toast({
        title: "Step 1 Complete!",
        description: "Proceeding to account setup.",
      });
      setLocation("/register/step2");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Step1FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Progress Bar */}
        <RegistrationProgress 
          currentStep={1} 
          totalSteps={2} 
          stepTitle="Basic Information" 
        />

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-professional rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 mt-2">Start securing your digital legacy today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="mt-2"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex mt-2">
                  <Select
                    value={watch("countryCode")}
                    onValueChange={(value) => setValue("countryCode", value)}
                  >
                    <SelectTrigger className="w-20 rounded-r-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">+91</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    {...register("mobileNumber")}
                    placeholder="Enter mobile number"
                    className="flex-1 rounded-l-none border-l-0"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.mobileNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter your complete address"
                  rows={3}
                  className="mt-2"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Processing..." : "Continue to Next Step"}
              </Button>
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
