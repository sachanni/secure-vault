import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";

const nomineeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  relationship: z.string().min(1, "Please select a relationship"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
});

type NomineeFormData = z.infer<typeof nomineeSchema>;

const relationshipOptions = [
  "Spouse",
  "Son",
  "Daughter", 
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Friend",
  "Other"
];

export default function AddNominee() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NomineeFormData>({
    resolver: zodResolver(nomineeSchema),
  });

  const relationship = watch("relationship");

  const mutation = useMutation({
    mutationFn: async (data: NomineeFormData) => {
      const response = await apiRequest("POST", "/api/nominees", data);
      if (!response.ok) {
        const errorData = await response.text();
        // Check if response is HTML (not JSON)
        if (errorData.includes("<!DOCTYPE html>")) {
          throw new Error("Authentication required. Please log in again.");
        }
        try {
          const jsonError = JSON.parse(errorData);
          throw new Error(jsonError.message || "Failed to add nominee");
        } catch {
          throw new Error("Failed to add nominee. Please try again.");
        }
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Nominee added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nominees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NomineeFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Nominee</CardTitle>
                <p className="text-gray-600">Add a trusted family member or friend</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter nominee's full name"
                  className="mt-2"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select onValueChange={(value) => setValue("relationship", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-red-500 text-sm mt-1">{errors.relationship.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  {...register("mobileNumber")}
                  placeholder="Enter mobile number"
                  className="mt-2"
                  type="tel"
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  className="mt-2"
                  type="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your nominee will be contacted for verification</li>
                  <li>• They will receive notifications if you become unresponsive</li>
                  <li>• You can add multiple nominees for different assets</li>
                  <li>• Nominees must be verified before receiving notifications</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {mutation.isPending ? "Adding..." : "Add Nominee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}