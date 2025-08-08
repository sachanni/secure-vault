import { Progress } from "@/components/ui/progress";

interface RegistrationProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function RegistrationProgress({ currentStep, totalSteps, stepTitle }: RegistrationProgressProps) {
  const progressValue = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Create Your Account</h1>
        <p className="text-gray-600 text-lg">Step {currentStep} of {totalSteps}: {stepTitle}</p>
      </div>
      
      <div className="max-w-sm mx-auto">
        <Progress 
          value={progressValue} 
          className="h-2 bg-gray-200 rounded-full overflow-hidden"
        />
      </div>
    </div>
  );
}