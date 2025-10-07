import React, { useState, useEffect } from 'react';
import './EditPageLaunch.css';

function EditPageLaunch({ formData, updateFormData, prevStep }) {
  const [selectedFeaturedProduct, setSelectedFeaturedProduct] = useState(formData.featuredColor || null);
  const [description, setDescription] = useState('');
  const [availableColors, setAvailableColors] = useState([]);
  const maxDescriptionLength = 150;

  // Load colors from JSON file
  useEffect(() => {
    fetch('/colors.json')
      .then(response => response.json())
      .then(data => setAvailableColors(data.colors))
      .catch(error => console.error('Error loading colors:', error));
  }, []);

  const handleLaunch = () => {
    alert('Campaign launched successfully! 🎉\n\nThis is a demo. In production, this would submit your campaign for review.');
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxDescriptionLength) {
      setDescription(value);
      updateFormData('description', value);
    }
  };

  // Get featured products from selected colors
  const featuredProducts = formData.selectedColors && formData.selectedColors.length > 0
    ? formData.selectedColors.map(colorId => {
        const color = availableColors.find(c => c.id === colorId);
        return color ? {
          id: colorId,
          color: color.code,
          name: color.name,
          border: color.code === '#ffffff'
        } : null;
      }).filter(Boolean)
    : [];

  return (
    <div className="edit-page-launch">
      <div className="content-layout">
        {/* Left Column - Product Preview */}
        <div className="preview-column">
          <div className="product-preview">
            <div className="tshirt-mockup-container">
              <img
                src="https://d3fc22kf489ohb.cloudfront.net/img/product/original/60c1f2236503d9.80322275.png"
                alt="T-shirt mockup"
                className="tshirt-base-image"
                style={{
                  filter: selectedFeaturedProduct === 'white' ? 'none' : 'hue-rotate(340deg) saturate(3)'
                }}
              />
              <div className="design-overlay">
                {formData.artworkPreview && (
                  <img src={formData.artworkPreview} alt="Design preview" className="design-image" />
                )}
              </div>
            </div>
          </div>

          <div className="featured-product-section">
            <p className="featured-label">FEATURED PRODUCT</p>
            <div className="color-selector">
              {featuredProducts.map(product => (
                <label key={product.id} className="color-radio">
                  <input
                    type="radio"
                    name="featuredProduct"
                    value={product.id}
                    checked={selectedFeaturedProduct === product.id}
                    onChange={() => setSelectedFeaturedProduct(product.id)}
                  />
                  <div
                    className="color-circle"
                    style={{
                      backgroundColor: product.color,
                      border: product.border ? '2px solid #ddd' : 'none'
                    }}
                  >
                    {selectedFeaturedProduct === product.id && (
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M3 8l3 3 7-7" stroke={product.color === '#ffffff' ? '#000' : '#fff'} strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Campaign Details */}
        <div className="details-column">
          <button className="btn-add-logo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            ADD YOUR LOGO
          </button>

          <div className="form-group">
            <label className="form-label-simple">Campaign name</label>
            <input
              type="text"
              className="form-input-simple"
              value={formData.campaignTitle}
              onChange={(e) => updateFormData('campaignTitle', e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="form-group">
            <label className="form-label-simple">
              Campaign slug
              <span className="help-icon-small">?</span>
            </label>
            <input
              type="text"
              className="form-input-simple"
              value={formData.campaignTitle ? formData.campaignTitle.toLowerCase().replace(/\s+/g, '-') : ''}
              readOnly
              placeholder="campaign-slug"
            />
          </div>

          <div className="price-display">
            £{((parseFloat(formData.baseCost || 20) + parseFloat(formData.profit || 5)).toFixed(2))}
          </div>

          <div className="form-group">
            <textarea
              className="form-textarea-large"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Write a short description about your campaign and design. This will be what everyone reads first so makes sure it's clear and concise. There is a 150 character limit."
              rows="6"
            />
            <div className="character-count">
              {description.length}/{maxDescriptionLength}
            </div>
          </div>

          <div className="creator-section">
            <label className="form-label-simple">Creator name</label>
            <div className="creator-input-container">
              <input
                type="text"
                className="form-input-simple"
                value={formData.creatorName}
                onChange={(e) => updateFormData('creatorName', e.target.value)}
                placeholder="Enter your name"
              />
              <span className="help-icon-small">?</span>
            </div>
          </div>
        </div>
      </div>

      <div className="button-section">
        <button className="btn-back" onClick={prevStep}>
          ← BACK
        </button>
        <button className="btn-launch" onClick={handleLaunch}>
          LAUNCH CAMPAIGN
        </button>
      </div>
    </div>
  );
}

export default EditPageLaunch;
