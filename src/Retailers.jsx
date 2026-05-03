import React from 'react';
import './Retailers.css';

const retailers = [
  {
    location: 'London',
    store: 'Minimode Clad'
  },
  {
    location: 'Manchester',
    store: 'Little Me'
  },
  {
    location: 'Antwerp',
    store: 'Bel Kids'
  },
  {
    location: 'Israel',
    store: 'Toddle Over Little Princess'
  },
  {
    location: 'Lakewood',
    store: 'Little Women Too'
  },
  {
    location: 'Five Towns',
    store: 'Ciao Bimby'
  }
];

const Retailers = () => {
  return (
    <main className="retailers-page">
      <section className="retailers-hero">
        <div className="retailers-shell">
          <p className="retailers-kicker">Stockists</p>
          <h1>Retailers</h1>
          <p className="retailers-intro">
            Discover selected stores that carry FYVE pieces.
          </p>
        </div>
      </section>

      <section className="retailers-list-section">
        <div className="retailers-shell">
          <div className="retailers-list">
            {retailers.map((retailer) => (
              <div className="retailer-row" key={`${retailer.location}-${retailer.store}`}>
                <span className="retailer-location">{retailer.location}</span>
                <span className="retailer-store">{retailer.store}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Retailers;