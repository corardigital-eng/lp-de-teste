import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  id?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  id
}) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 text-base font-bold transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white focus:ring-green-500 border border-transparent",
    secondary: "bg-white hover:bg-gray-50 text-brand-primary focus:ring-brand-primary border border-gray-200",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-dark"
  };

  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      id={id}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
      <ArrowRight className="ml-2 w-5 h-5" />
    </button>
  );
};