import React from "react";

const Link = ({ children, href, ...props }: any) => (
  <a href={href as string} {...props}>
    {children}
  </a>
);

export default Link;
