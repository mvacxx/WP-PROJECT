import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-700'
        : 'bg-slate-100 text-slate-900 hover:bg-slate-200';

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ${variantClass} ${className}`}
      {...props}
    />
  );
}
