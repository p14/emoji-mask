import React from 'react';

const SupportButton: React.FC = () => {
  return (
    <div style={{ marginTop: 2, textAlign: 'center' }}>
      <a href='https://www.buymeacoffee.com/perezident14' target='_blank' rel='noreferrer'>
        <img
          src='https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png'
          alt='Buy Me A Coffee'
          height='60px'
          width='217px'
        />
      </a>
    </div>
  );
};

export default SupportButton;
