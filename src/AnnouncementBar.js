import React from 'react';
import './AnnouncementBar.css';

const items = Array(10).fill('FREE SHIPPING SITEWIDE');

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-marquee">
        <div className="announcement-group">
          {items.map((item, index) => (
            <span key={`group1-${index}`}>{item}</span>
          ))}
        </div>
        <div className="announcement-group" aria-hidden="true">
          {items.map((item, index) => (
            <span key={`group2-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;