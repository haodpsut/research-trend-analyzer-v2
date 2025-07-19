
import React from 'react';

interface Step {
  id: number;
  name: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {currentStep > step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-brand-primary" />
                </div>
                <a href="#" className="relative w-8 h-8 flex items-center justify-center bg-brand-primary rounded-full hover:bg-brand-secondary">
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : currentStep === step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-brand-primary rounded-full" aria-current="step">
                  <span className="h-2.5 w-2.5 bg-brand-primary rounded-full" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                  <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </a>
              </>
            )}
            <span className="absolute -bottom-6 text-xs text-center w-20 -ml-6 sm:-ml-0 sm:w-auto sm:ml-0 sm:static sm:mt-2 sm:block">{step.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
