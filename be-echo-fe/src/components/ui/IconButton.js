import React from "react";

const IconButton = ({ children, label, ...props }) => (
  <button type="button" className="icon-button" aria-label={label} {...props}>
    {children}
  </button>
);

export default IconButton;

