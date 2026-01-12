import React from 'react';

const WatchProviders = ({ providers }) => {
  if (!providers) {
    return null;
  }

  const results = providers.results || {};
  const lang = (navigator.language || 'en-US').toUpperCase();
  const country = (lang.split('-')[1] || 'US').toUpperCase();
  const region = results[country] || results[Object.keys(results)[0]];

  if (!region) {
    return (
      <div className="ott-section">
        <h4>Available on</h4>
        <div className="ott-none">Not available on OTT platforms.</div>
      </div>
    );
  }

  const groups = [
    { key: 'flatrate', label: 'Streaming' },
    { key: 'rent', label: 'Rent' },
    { key: 'buy', label: 'Buy' },
    { key: 'ads', label: 'Free' },
  ];

  const renderedGroups = groups
    .map((g) => {
      const list = region[g.key] || [];
      if (!list.length) return null;
      return (
        <div className="ott-group" key={g.key}>
          <div className="ott-group-label">{g.label}</div>
          <div className="ott-group-list">
            {list.map((p) => (
              <div
                className="ott-item"
                key={p.provider_id}
                title={p.provider_name}
              >
                {p.logo_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                    alt={p.provider_name}
                  />
                ) : (
                  <span className="ott-name">{p.provider_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    })
    .filter(Boolean);

  if (renderedGroups.length === 0) {
     return (
      <div className="ott-section">
        <h4>Available on</h4>
        <div className="ott-none">Not available on OTT platforms.</div>
      </div>
    );
  }

  return (
    <div className="ott-section">
      <h4>Available on</h4>
      <div className="ott-list">{renderedGroups}</div>
    </div>
  );
};

export default WatchProviders;
