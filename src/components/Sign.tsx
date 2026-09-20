import React from 'react';

interface SignProps {
  eyebrow?: string;
  title: string;
  copy?: string;
}

export const Sign: React.FC<SignProps> = ({ eyebrow, title, copy }) => {
  const normalizedTitle = title.replace(/\\n/g, '\n');

  return (
    <div className="wood-sign">
      {eyebrow && <span>{eyebrow}</span>}
      <h1>{normalizedTitle}</h1>
      {copy && <p>{copy}</p>}
      <i className="nail n1" />
      <i className="nail n2" />
    </div>
  );
};
