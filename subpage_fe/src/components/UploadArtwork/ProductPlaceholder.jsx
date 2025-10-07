import React from 'react';

const ProductPlaceholder = ({ className, width = 80, height = 80 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="80" height="80" fill="#F5F5F5"/>
    <path
      d="M40 15L50 25H30L40 15Z"
      fill="#E0E0E0"
    />
    <rect x="25" y="25" width="30" height="35" fill="#E0E0E0"/>
    <rect x="30" y="60" width="8" height="5" fill="#E0E0E0"/>
    <rect x="42" y="60" width="8" height="5" fill="#E0E0E0"/>
    <circle cx="40" cy="40" r="8" fill="#BDBDBD"/>
  </svg>
);

export default ProductPlaceholder;
