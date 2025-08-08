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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Coins } from "lucide-react";

const assetSchema = z.object({
  assetType: z.string().min(1, "Please select an asset type"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  value: z.string().min(1, "Value is required"),
  currency: z.string().default("USD"),
  contactInfo: z.string().min(10, "Contact information is required"),
  storageLocation: z.string().min(1, "Please select a storage location"),
  accessInstructions: z.string().min(10, "Access instructions are required"),
});

type AssetFormData = z.infer<typeof assetSchema>;

const assetTypes = [
  "Bank Account",
  "Investment Account", 
  "Cryptocurrency",
  "Real Estate",
  "Insurance Policy",
  "Digital Account",
  "Physical Asset",
  "Other"
];

const currencies = [
  "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"
];

const storageLocations = [
  "Google Drive",
  "DigiLocker", 
  "Local Server",
  "Physical Safe",
  "Bank Locker"
];

export default function AddAsset() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      currency: "USD",
    },
  });

  const assetType = watch("assetType");
  const currency = watch("currency");
  const storageLocation = watch("storageLocation");

  const mutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      const response = await apiRequest("/api/assets", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Asset added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
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

  const onSubmit = (data: AssetFormData) => {
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Asset</CardTitle>
                <p className="text-gray-600">Add a digital or physical asset to your vault</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select onValueChange={(value) => setValue("assetType", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assetType && (
                  <p className="text-red-500 text-sm mt-1">{errors.assetType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Chase Checking Account, Bitcoin Wallet"
                  className="mt-2"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Detailed description of the asset"
                  className="mt-2"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    {...register("value")}
                    placeholder="100000"
                    className="mt-2"
                    type="number"
                  />
                  {errors.value && (
                    <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={currency} onValueChange={(value) => setValue("currency", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contactInfo">Contact Information *</Label>
                <Input
                  id="contactInfo"
                  {...register("contactInfo")}
                  placeholder="Bank/Institution contact details"
                  className="mt-2"
                />
                {errors.contactInfo && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactInfo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="storageLocation">Storage Location *</Label>
                <Select onValueChange={(value) => setValue("storageLocation", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select storage location" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.storageLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.storageLocation.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="accessInstructions">Access Instructions *</Label>
                <Textarea
                  id="accessInstructions"
                  {...register("accessInstructions")}
                  placeholder="How to access this asset (login details, location, etc.)"
                  className="mt-2"
                  rows={4}
                />
                {errors.accessInstructions && (
                  <p className="text-red-500 text-sm mt-1">{errors.accessInstructions.message}</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Security Notice</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• All asset information is encrypted and stored securely</li>
                  <li>• Access instructions should be detailed but avoid full passwords</li>
                  <li>• Your nominees will receive this information only after verification</li>
                  <li>• Regular updates to asset values are recommended</li>
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
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {mutation.isPending ? "Adding..." : "Add Asset"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}