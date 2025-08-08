import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, Clock, Smartphone, AlertTriangle } from "lucide-react";

const wellBeingSettingsSchema = z.object({
  alertFrequency: z.enum(["daily", "weekly", "custom"]),
  customDays: z.number().min(1).max(30).optional(),
  alertTime: z.string(), // HH:MM format
  enableSMS: z.boolean(),
  enableEmail: z.boolean(),
  maxMissedAlerts: z.number().min(1).max(50),
  escalationEnabled: z.boolean(),
});

type WellBeingSettingsData = z.infer<typeof wellBeingSettingsSchema>;

const alertFrequencyOptions = [
  { value: "daily", label: "Daily", description: "Check in every day" },
  { value: "weekly", label: "Weekly", description: "Check in once per week" },
  { value: "custom", label: "Custom", description: "Set custom interval" }
];

export default function WellBeingSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["/api/wellbeing/settings"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WellBeingSettingsData>({
    resolver: zodResolver(wellBeingSettingsSchema),
    defaultValues: {
      alertFrequency: "daily",
      alertTime: "09:00",
      enableSMS: true,
      enableEmail: true,
      maxMissedAlerts: 15,
      escalationEnabled: true,
    },
  });

  const alertFrequency = watch("alertFrequency");
  const escalationEnabled = watch("escalationEnabled");

  const updateMutation = useMutation({
    mutationFn: async (data: WellBeingSettingsData) => {
      const response = await apiRequest("PUT", "/api/wellbeing/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your well-being alert settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wellbeing/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testAlertMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/wellbeing/test-alert", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Alert Sent",
        description: "A test well-being alert has been sent to your configured channels.",
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

  const onSubmit = (data: WellBeingSettingsData) => {
    updateMutation.mutate(data);
  };

  const handleTestAlert = () => {
    testAlertMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
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

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Well-being Settings</CardTitle>
                  <p className="text-gray-600">Configure your well-being check alerts and monitoring</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Check-in Frequency Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Check-in Frequency
                  </h3>
                  <p className="text-gray-600 mb-4">Configure how often you want to receive well-being check alerts</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="alertFrequency">Alert Frequency *</Label>
                      <Select onValueChange={(value: any) => setValue("alertFrequency", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {alertFrequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.alertFrequency && (
                        <p className="text-red-500 text-sm mt-1">{errors.alertFrequency.message}</p>
                      )}
                    </div>

                    {alertFrequency === "custom" && (
                      <div>
                        <Label htmlFor="customDays">Custom Interval (Days) *</Label>
                        <Input
                          id="customDays"
                          type="number"
                          min="1"
                          max="30"
                          {...register("customDays", { valueAsNumber: true })}
                          placeholder="e.g., 3"
                          className="mt-2"
                        />
                        {errors.customDays && (
                          <p className="text-red-500 text-sm mt-1">{errors.customDays.message}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="alertTime">Preferred Alert Time *</Label>
                      <Input
                        id="alertTime"
                        type="time"
                        {...register("alertTime")}
                        className="mt-2"
                      />
                      {errors.alertTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.alertTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Channels Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Notification Channels
                  </h3>
                  <p className="text-gray-600 mb-4">Choose how you want to receive well-being alerts</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableSMS" className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via text message</p>
                      </div>
                      <Switch
                        id="enableSMS"
                        onCheckedChange={(checked) => setValue("enableSMS", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableEmail" className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via email</p>
                      </div>
                      <Switch
                        id="enableEmail"
                        onCheckedChange={(checked) => setValue("enableEmail", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Escalation Settings Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Escalation Settings
                  </h3>
                  <p className="text-gray-600 mb-4">Configure when to escalate to emergency contacts</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="escalationEnabled" className="text-base font-medium">Enable Auto-Escalation</Label>
                        <p className="text-sm text-gray-600">Automatically notify nominees if you miss alerts</p>
                      </div>
                      <Switch
                        id="escalationEnabled"
                        onCheckedChange={(checked) => setValue("escalationEnabled", checked)}
                      />
                    </div>

                    {escalationEnabled && (
                      <div>
                        <Label htmlFor="maxMissedAlerts">Maximum Missed Alerts Before Escalation *</Label>
                        <Input
                          id="maxMissedAlerts"
                          type="number"
                          min="1"
                          max="50"
                          {...register("maxMissedAlerts", { valueAsNumber: true })}
                          placeholder="15"
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Number of consecutive missed check-ins before nominees are notified
                        </p>
                        {errors.maxMissedAlerts && (
                          <p className="text-red-500 text-sm mt-1">{errors.maxMissedAlerts.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How Well-being Alerts Work</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll receive alerts at your chosen frequency and time</li>
                    <li>• Click "I'm Okay" to confirm your well-being and reset the counter</li>
                    <li>• Missing alerts increases your counter toward the escalation limit</li>
                    <li>• When limit is reached, your nominees will be contacted for verification</li>
                    <li>• Admin team will validate any reported concerns before taking action</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestAlert}
                    disabled={testAlertMutation.isPending}
                    className="flex-1"
                  >
                    {testAlertMutation.isPending ? "Sending..." : "Send Test Alert"}
                  </Button>
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
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}