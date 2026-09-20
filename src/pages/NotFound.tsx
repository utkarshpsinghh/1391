import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <section className="not-found wrap">
      <div className="parchment">
        <Compass />
        <h1>LOST IN THE KINGDOM</h1>
        <p>We couldn't find that alliance hall or page.</p>

        <Button to="/alliances">RETURN TO ALLIANCES</Button>
      </div>
    </section>
  );
};
