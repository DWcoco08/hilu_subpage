import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header.jsx';
import UploadArtwork from './components/UploadArtwork/UploadArtwork.jsx';
import SetPricesDuration from './components/SetPricesDuration/SetPricesDuration.jsx';
import EditPageLaunch from './components/EditPageLaunch/EditPageLaunch.jsx';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    artwork: null,
    artworkPreview: null,
    artworkBack: null,
    artworkBackPreview: null,
    baseCost: 20,
    profit: 5,
    currency: '$ USD',
    campaignDuration: 14,
    campaignTitle: '',
    description: '',
    creatorName: ''
  });

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <UploadArtwork formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <SetPricesDuration formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <EditPageLaunch formData={formData} updateFormData={updateFormData} prevStep={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header
        currentStep={currentStep}
        nextStep={nextStep}
        prevStep={prevStep}
      />
      <div className="app-content">
        {renderStep()}
      </div>
    </div>
  );
}

export default App;
