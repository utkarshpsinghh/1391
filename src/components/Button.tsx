import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  to?: string;
  children: React.ReactNode;
  kind?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  to,
  children,
  kind = 'gold',
  onClick,
  disabled
}) => {
  const c = `button ${kind}`;

  return to ? (
    <Link className={c} to={to}>
      {children}
      <ArrowRight size={18} />
    </Link>
  ) : (
    <button onClick={onClick} className={c} disabled={disabled}>
      {children}
    </button>
  );
};
