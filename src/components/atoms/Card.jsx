import React from 'react';
import { cn } from '@/utils/cn';

const Card = React.forwardRef(({ 
  className, 
  variant = 'default',
  children, 
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-xl border border-gray-200 transition-all duration-200";
  
  const variants = {
    default: "shadow-md hover:shadow-lg",
    elevated: "shadow-lg hover:shadow-xl",
    gradient: "bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl",
    glass: "glass-effect shadow-lg hover:shadow-xl"
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;