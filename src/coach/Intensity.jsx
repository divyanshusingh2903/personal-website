import React from "react";

const Intensity = ({ level }) => (
  <span className="intensity" aria-label={`Intensity ${level} of 3`} title={`Intensity ${level}/3`}>
    {[1, 2, 3].map((i) => (
      <i key={i} className={i <= level ? "on" : ""} />
    ))}
  </span>
);

export default Intensity;
