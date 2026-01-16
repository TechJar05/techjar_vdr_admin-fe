import type { RazorpayMode } from '../../types';

interface RazorpayModeIndicatorProps {
  mode: RazorpayMode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const RazorpayModeIndicator = ({ mode, size = 'md' }: RazorpayModeIndicatorProps) => {
  const isTest = mode === 'test';

  return (
    <div
      className={`
        inline-flex items-center gap-2 font-medium rounded-full
        ${sizeStyles[size]}
        ${isTest
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }
      `}
    >
      <span className={`w-2 h-2 rounded-full ${isTest ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
      <span>Razorpay {isTest ? 'Test' : 'Live'} Mode</span>
    </div>
  );
};
