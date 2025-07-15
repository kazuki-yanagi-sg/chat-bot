import React from "react";
import "./CloudBackground.css";

type Props = {
  timePhase: string;
};

function CloudBackground({ timePhase }: Props) {
  return (
    <div className="sky-background">
      <div className="cloud cloud1" />
      <div className="cloud cloud2" />
      <div className="cloud cloud3" />
      <div className="cloud cloud4" />
      <div className={`stars ${timePhase === "night" ? "show-stars" : "hide-stars"}`}>
        <div className="star star1">★</div>
        <div className="star star2">★</div>
        <div className="star star3">★</div>
        <div className="star star4">★</div>
        <div className="star star5">★</div>
      </div>
    </div>
  );
}

export default CloudBackground;
