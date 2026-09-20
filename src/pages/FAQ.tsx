import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { useKingdom } from '../context/KingdomContext';

export const FAQ: React.FC = () => {
  const { data } = useKingdom();
  const { faq } = data;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHero
        title="QUESTIONS FROM\nTRAVELLERS"
        subtitle="A few helpful notes before your journey begins."
      />

      <section className="faq wrap">
        {faq.length > 0 ? (
          faq.map((item, i) => (
            <div className="faq-item" key={item.question}>
              <button
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.question}</span>
                <ChevronDown className={open === i ? 'rotate' : ''} />
              </button>

              {open === i && (
                <div>
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="time-note">No traveller questions recorded in the ledger yet.</p>
        )}
      </section>
    </>
  );
};
