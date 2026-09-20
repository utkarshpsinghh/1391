import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackPlaceholder: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackPlaceholder,
  ...props
}) => {
  const [error, setError] = useState(!src);

  if (error || !src) {
    return <div className="team-pfp-placeholder">{fallbackPlaceholder}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
