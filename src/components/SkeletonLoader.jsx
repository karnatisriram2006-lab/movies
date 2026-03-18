import React from "react";
import "../css/SkeletonLoader.css";

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-info">
      <div className="skeleton-title"></div>
      <div className="skeleton-date"></div>
    </div>
  </div>
);

const SkeletonRow = ({ title, count = 6 }) => (
  <div className="skeleton-row">
    <h2 className="skeleton-row-title">{title}</h2>
    <div className="skeleton-row-container">
      {Array(count).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

const SkeletonHero = () => (
    <div className="skeleton-hero">
        <div className="skeleton-hero-content">
            <div className="skeleton-hero-title"></div>
            <div className="skeleton-hero-text"></div>
            <div className="skeleton-hero-buttons">
                <div className="skeleton-hero-btn"></div>
                <div className="skeleton-hero-btn"></div>
            </div>
        </div>
    </div>
)

export { SkeletonCard, SkeletonRow, SkeletonHero };
