import React, { useState } from 'react';
import './SetPricesDuration.css';

function SetPricesDuration({ formData, updateFormData, nextStep, prevStep }) {
  const [salesGoal, setSalesGoal] = useState(1);
  const [customDays, setCustomDays] = useState(28);
  const [selectedDuration, setSelectedDuration] = useState('14');

  const currencies = ['£ GBP', '$ USD', '€ EUR'];

  const handleDurationSelect = (days) => {
    setSelectedDuration(days);
    if (days !== 'custom') {
      updateFormData('campaignDuration', parseInt(days));
    }
  };

  const handleCustomDaysChange = (e) => {
    const value = parseInt(e.target.value) || 28;
    setCustomDays(value);
    if (selectedDuration === 'custom') {
      updateFormData('campaignDuration', value);
    }
  };

  const handleSalesGoalChange = (e) => {
    const value = parseInt(e.target.value);
    setSalesGoal(value);
  };

  // Calculate profit estimate
  const calculateProfit = () => {
    const profitPerItem = formData.profit || 5;
    return (profitPerItem * salesGoal).toFixed(2);
  };

  return (
    <div className="set-prices-duration">
      <div className="page-header">
        <h1 className="page-title">SET PRICES AND DURATION</h1>
        <p className="page-subtitle">
          Choose prices for each of the garments, set a sales target, and edit the sales duration for the campaign.
          <br />
          Profit per item increases with the amount of garments sold.
        </p>
      </div>

      <div className="content-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Set Product Prices */}
          <div className="section-card">
            <h3 className="section-title">SET PRODUCT PRICES</h3>
            <p className="section-description">
              You can set how much the garments are sold for as long as they make profit.
            </p>

            <div className="product-price-item">
              <div className="product-info">
                <div className="product-image-placeholder">
                  <img
                    src="https://d3fc22kf489ohb.cloudfront.net/img/product/original/60c1f2236503d9.80322275.png"
                    alt="Product"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="product-details">
                  <p className="product-brand">EVERPRESS</p>
                  <p className="product-name">Essentials Classic Tee</p>
                </div>
              </div>
              <div className="price-inputs">
                <div className="price-field">
                  <label>Base Cost</label>
                  <input
                    type="number"
                    value={formData.baseCost || 20}
                    onChange={(e) => updateFormData('baseCost', parseFloat(e.target.value))}
                    step="1"
                    min="0"
                  />
                </div>
                <div className="price-field">
                  <label>
                    Profit/Sale
                    <span className="help-icon" title="Your profit per item sold">?</span>
                  </label>
                  <input
                    type="number"
                    value={formData.profit || 5}
                    onChange={(e) => updateFormData('profit', parseFloat(e.target.value))}
                    step="1"
                    min="0"
                  />
                </div>
                <div className="price-field">
                  <label>
                    Selling Price
                    <span className="help-icon" title="Total price customers will pay">?</span>
                  </label>
                  <input
                    type="number"
                    value={(parseFloat(formData.baseCost || 20) + parseFloat(formData.profit || 5)).toFixed(2)}
                    readOnly
                    className="readonly-price"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Currency */}
          <div className="section-card">
            <h3 className="section-title">CAMPAIGN CURRENCY</h3>
            <p className="section-description">This is reflected in your reports.</p>

            <div className="currency-select-wrapper">
              <label className="input-label">Currency</label>
              <select
                className="currency-select"
                value={formData.currency || '£ GBP'}
                onChange={(e) => updateFormData('currency', e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sales Duration */}
          <div className="section-card">
            <div className="section-header-with-icon">
              <h3 className="section-title">SALES DURATION</h3>
              <span className="help-icon" title="How long your campaign will run for">?</span>
            </div>
            <p className="section-description">
              Choose how many days you'd like the campaign to run for:
            </p>

            <div className="duration-buttons">
              <button
                className={`duration-btn ${selectedDuration === '7' ? 'active' : ''}`}
                onClick={() => handleDurationSelect('7')}
              >
                7 DAYS
              </button>
              <button
                className={`duration-btn ${selectedDuration === '14' ? 'active' : ''}`}
                onClick={() => handleDurationSelect('14')}
              >
                14 DAYS
              </button>
              <button
                className={`duration-btn ${selectedDuration === '21' ? 'active' : ''}`}
                onClick={() => handleDurationSelect('21')}
              >
                21 DAYS
              </button>
              <button
                className={`duration-btn ${selectedDuration === 'custom' ? 'active' : ''}`}
                onClick={() => handleDurationSelect('custom')}
              >
                28+ DAYS
              </button>
            </div>

            {selectedDuration === 'custom' && (
              <div className="custom-days-input">
                <label className="input-label">Days</label>
                <input
                  type="number"
                  value={customDays}
                  onChange={handleCustomDaysChange}
                  min="28"
                  max="365"
                />
              </div>
            )}
          </div>

          {/* Sales Goal */}
          <div className="section-card">
            <div className="section-header-with-icon">
              <h3 className="section-title">SALES GOAL</h3>
              <span className="help-icon" title="Estimated number of items you expect to sell">?</span>
            </div>
            <p className="section-description">
              How many items do you estimate your design will sell?
            </p>

            <div className="slider-container">
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="1"
                  max="1250"
                  value={salesGoal}
                  onChange={handleSalesGoalChange}
                  className="sales-slider"
                  style={{
                    '--progress-value': `${((salesGoal - 1) / (1250 - 1)) * 100}%`
                  }}
                />
                <div
                  className="slider-tooltip"
                  style={{
                    left: `${((salesGoal - 1) / (1250 - 1)) * 100}%`
                  }}
                >
                  {salesGoal}
                </div>
              </div>
              <div className="slider-labels">
                <span className={salesGoal >= 1 ? 'active' : ''}>1</span>
                <span className={salesGoal >= 250 ? 'active' : ''}>250</span>
                <span className={salesGoal >= 500 ? 'active' : ''}>500</span>
                <span className={salesGoal >= 750 ? 'active' : ''}>750</span>
                <span className={salesGoal >= 1000 ? 'active' : ''}>1000</span>
                <span className={salesGoal >= 1250 ? 'active' : ''}>1250</span>
              </div>
              <div className="sales-value">
                <label>Sales</label>
                <span className="value">{salesGoal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Profit Estimate */}
          <div className="section-card profit-card">
            <h3 className="section-title">PROFIT ESTIMATE</h3>
            <p className="profit-description">With {salesGoal} sales you'll earn an estimated:</p>
            <div className="profit-amount">
              £{calculateProfit()}
              <span className="per-campaign">per campaign</span>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="btn-back" onClick={prevStep}>
          ← BACK
        </button>
        <button className="btn-next" onClick={nextStep}>
          NEXT STEP →
        </button>
      </div>
    </div>
  );
}

export default SetPricesDuration;
