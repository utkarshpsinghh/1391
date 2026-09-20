import React from 'react';
import { Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { useKingdom } from '../context/KingdomContext';

export const Transfer: React.FC = () => {
  const { data } = useKingdom();
  const steps = [
    'CHECK REQUIREMENTS',
    'CHOOSE AN ALLIANCE',
    'CONTACT THE LEADERS',
    'SUBMIT YOUR APPLICATION',
    'PREPARE FOR TRANSFER'
  ];

  return (
    <>
      <PageHero
        title={`TRANSFER TO\nKINGDOM ${data.settings.kingdomNumber}`}
        subtitle="Your next chapter starts here."
      />

      <section className="transfer wrap">
        <div className="questline">
          {steps.map((s, i) => (
            <div className="quest-step" key={s}>
              <span>{i + 1}</span>

              <div>
                <small>QUEST OBJECTIVE</small>
                <h2>{s}</h2>

                <p>
                  {[
                    'Review your eligibility and account details before beginning.',
                    'Explore alliance schedules and find a home that suits your rhythm.',
                    'Speak with an alliance representative to confirm the latest details.',
                    'Send a short enquiry so leaders can welcome you properly.',
                    'Follow the confirmed in-game transfer process.'
                  ][i]}
                </p>
              </div>
            </div>
          ))}
        </div>

        <aside className="parchment checklist">
          <h2>TRANSFER CHECKLIST</h2>

          {[
            'Check your transfer eligibility',
            'Check your account requirements',
            'Review alliance schedules',
            'Choose your preferred alliance',
            'Contact the alliance representative',
            'Complete the transfer process'
          ].map(x => (
            <p key={x}>
              <Check /> {x}
            </p>
          ))}

          <div className="important">
            <b>IMPORTANT</b>
            <br />
            Your transfer is confirmed only after you have been contacted and verified by one of
            our representatives.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '18px' }}>
            <Button to="/apply" kind="gold">
              APPLY TO JOIN
            </Button>
          </div>
        </aside>
      </section>
    </>
  );
};
