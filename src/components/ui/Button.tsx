import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg";

  const variants = {
    primary: "bg-brand-pink text-white hover:bg-brand-pink-dark shadow-lg shadow-brand-pink/30 hover:shadow-brand-pink/50 disabled:bg-gray-300 dark:disabled:bg-gray-700",
    outline: "border-2 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white",
    ghost: "text-gray-600 dark:text-gray-300 hover:text-brand-pink hover:bg-pink-50 dark:hover:bg-white/5",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
