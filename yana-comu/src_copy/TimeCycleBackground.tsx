import React, { useEffect, useState } from "react";
import "./TimeCycleBackground.css";

const TIME_PHASES = ["morning", "noon", "evening", "night"];

function TimeCycleBackground() {
  const [timePhase, setTimePhase] = useState("morning");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % TIME_PHASES.length;
      setTimePhase(TIME_PHASES[index]);
    }, 20000); // 20秒ごと

    return () => clearInterval(interval);
  }, []);

  return <div className={`time-background ${timePhase}`} />;
}

export default TimeCycleBackground;
