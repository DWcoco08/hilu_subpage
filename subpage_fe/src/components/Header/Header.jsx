import React from 'react';
import './Header.css';

function Header({ currentStep, nextStep, prevStep }) {
  const steps = [
    { number: 1, label: 'Upload Artwork' },
    { number: 2, label: 'Set Prices and Duration' },
    { number: 3, label: 'Edit Page and Launch' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">E</div>
          <div className="steps-navigation">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
                  <span className="step-number">{step.number}</span>
                  <span className="step-label">{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className="step-divider">—</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn-header-secondary"
            onClick={nextStep}
            disabled={currentStep === 3}
          >
            START SELLING
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
