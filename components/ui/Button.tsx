import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-pink text-white hover:bg-brand-pink-dark shadow-lg shadow-brand-pink/30 hover:shadow-brand-pink/50",
    outline: "border-2 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white",
    ghost: "text-gray-600 hover:text-brand-pink hover:bg-pink-50",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
