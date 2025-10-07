import React, { useState, useEffect } from 'react';
import './UploadArtwork.css';
import ProductPlaceholder from './ProductPlaceholder';

function UploadArtwork({ formData, updateFormData, nextStep }) {
  const [showBack, setShowBack] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [featuredColor, setFeaturedColor] = useState('white');
  const [isFrontSaved, setIsFrontSaved] = useState(false);
  const [isBackSaved, setIsBackSaved] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);

  // Load colors from JSON file
  useEffect(() => {
    fetch('/colors.json')
      .then(response => response.json())
      .then(data => setAvailableColors(data.colors))
      .catch(error => console.error('Error loading colors:', error));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (showBack) {
          updateFormData('artworkBack', file);
          updateFormData('artworkBackPreview', e.target.result);
          setIsBackSaved(false);
        } else {
          updateFormData('artwork', file);
          updateFormData('artworkPreview', e.target.result);
          setIsFrontSaved(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAreaClick = () => {
    const currentArtwork = showBack ? formData.artworkBack : formData.artwork;
    if (!currentArtwork) {
      document.getElementById('file-upload').click();
    }
  };

  const handleSave = () => {
    if (showBack) {
      if (formData.artworkBack) {
        setIsBackSaved(true);
        alert('Back artwork saved! In production, this would save to the server.');
      }
    } else {
      if (formData.artwork) {
        setIsFrontSaved(true);
        alert('Front artwork saved! In production, this would save to the server.');
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this artwork?')) {
      if (showBack) {
        updateFormData('artworkBack', null);
        updateFormData('artworkBackPreview', null);
        setIsBackSaved(false);
      } else {
        updateFormData('artwork', null);
        updateFormData('artworkPreview', null);
        setIsFrontSaved(false);
      }
    }
  };

  const handlePreview = () => {
    alert('Preview functionality would show full-size preview here.');
  };

  const toggleColor = (colorId) => {
    if (selectedColors.includes(colorId)) {
      const newColors = selectedColors.filter(c => c !== colorId);
      if (newColors.length > 0) {
        setSelectedColors(newColors);
        updateFormData('selectedColors', newColors);
        if (featuredColor === colorId) {
          setFeaturedColor(newColors[0]);
          updateFormData('featuredColor', newColors[0]);
        }
      }
    } else {
      const newColors = [...selectedColors, colorId];
      setSelectedColors(newColors);
      updateFormData('selectedColors', newColors);
    }
  };

  const handleFeaturedColorChange = (colorId) => {
    if (selectedColors.includes(colorId)) {
      setFeaturedColor(colorId);
      updateFormData('featuredColor', colorId);
    }
  };

  return (
    <div className="upload-artwork">
      {/* Left Panel - Color Selection */}
      {formData.artwork && isFrontSaved && (
        <div className="color-selection-panel">
          <div className="panel-section">
            <h3 className="panel-title">SELECT PRODUCT COLOURS</h3>
            <p className="panel-subtitle">Hover to preview, then click to confirm/remove a selection.</p>

            <div className="color-grid">
              {availableColors.map(color => (
                <div
                  key={color.id}
                  className={`color-option ${selectedColors.includes(color.id) ? 'selected' : ''}`}
                  onClick={() => toggleColor(color.id)}
                  title={color.name}
                >
                  <div
                    className="color-swatch"
                    style={{
                      backgroundColor: color.code,
                      border: color.id === 'white' ? '2px solid #ddd' : 'none'
                    }}
                  />
                  {selectedColors.includes(color.id) && (
                    <svg className="check-icon" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M3 8 L6 11 L13 4" stroke="#fff" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3 className="panel-title">SELECT FEATURED COLOUR</h3>
            <p className="panel-subtitle">The default colour to be displayed for this product</p>

            <div className="featured-color-grid">
              {selectedColors.map(colorId => {
                const color = availableColors.find(c => c.id === colorId);
                return (
                  <div
                    key={colorId}
                    className={`featured-color-option ${featuredColor === colorId ? 'selected' : ''}`}
                    onClick={() => handleFeaturedColorChange(colorId)}
                  >
                    <div
                      className="color-swatch"
                      style={{
                        backgroundColor: color.code,
                        border: colorId === 'white' ? '2px solid #ddd' : 'none'
                      }}
                    />
                    {featuredColor === colorId && (
                      <svg className="radio-check" width="12" height="12" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="5" fill="#fff" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Center - Mockup Section */}
      <div className="upload-container">
        <div className="mockup-section">
          <img
            src="https://d3fc22kf489ohb.cloudfront.net/img/product/original/60c1f2236503d9.80322275.png"
            alt="T-shirt mockup"
            className={`mockup-image ${showBack ? 'mockup-back' : 'mockup-front'}`}
          />
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''} ${(showBack ? formData.artworkBack : formData.artwork) ? 'has-image' : ''} ${showBack ? 'upload-zone-back' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            {!(showBack ? formData.artworkBack : formData.artwork) ? (
              <div className="upload-content">
                <h4 className="upload-title">UPLOAD YOUR DESIGN</h4>
                <p className="upload-subtitle">Drag and drop it here</p>
                <div className="upload-icon">
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <path
                      d="M35 10 L35 45 M20 30 L35 15 L50 30"
                      stroke="#666"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="10" y="50" width="50" height="10" fill="#666" rx="2" />
                  </svg>
                </div>
                <p className="upload-recommendation">
                  Recommended: <br /> PNG format, 300 DPI
                </p>
              </div>
            ) : (
              <img
                src={showBack ? formData.artworkBackPreview : formData.artworkPreview}
                alt="Uploaded design"
                className="uploaded-image"
              />
            )}
            <input
              type="file"
              id="file-upload"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Save/Delete/Preview Buttons */}
          {((showBack && formData.artworkBack) || (!showBack && formData.artwork)) && (
            <div className="action-buttons">
              <button className="btn-action btn-preview" onClick={handlePreview}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M1 8s2-5 7-5 7 5 7 5-2 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Preview
              </button>
              <button className="btn-action btn-save" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" />
                </svg>
                Save
              </button>
              <button className="btn-action btn-delete" onClick={handleDelete}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="controls">
          <button className="btn-toggle" onClick={() => setShowBack(!showBack)}>
            <svg width="13" height="13" viewBox="0 0 13 13">
              <path
                d="M2 6.5 L11 6.5 M6.5 2 L11 6.5 L6.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            <span>{showBack ? 'SEE FRONT' : 'SEE BACK'}</span>
          </button>
          <button className="btn-guidelines" onClick={() => setShowGuidelines(true)}>
            ARTWORK GUIDELINES
          </button>
        </div>
      </div>

      {/* Right Panel - Product Selection */}
      {formData.artwork && isFrontSaved && (
        <div className="product-selection-panel">
          <h3 className="panel-title">SELECT PRODUCTS</h3>
          <div className="selected-product">
            <ProductPlaceholder className="product-thumb" />
            <div className="product-info">
              <p className="product-brand">EVERPRESS</p>
              <p className="product-name">Essentials Classic Tee</p>
            </div>
          </div>
          <button className="btn-edit-products" onClick={() => setShowProductModal(true)}>
            ADD/EDIT PRODUCTS
          </button>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowProductModal(false)}></div>
          <div className="product-modal">
            <div className="modal-header">
              <h2 className="modal-title">SELECT PRODUCTS</h2>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-filters">
              <div className="filter-group">
                <label>Product type</label>
                <select className="filter-select">
                  <option>All products</option>
                  <option>T-shirts</option>
                  <option>Hoodies</option>
                  <option>Sweatshirts</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Gender</label>
                <select className="filter-select">
                  <option>All</option>
                  <option>Unisex</option>
                  <option>Women</option>
                  <option>Men</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Fit</label>
                <select className="filter-select">
                  <option>All</option>
                  <option>Regular</option>
                  <option>Slim</option>
                  <option>Relaxed</option>
                </select>
              </div>
            </div>

            <div className="modal-content">
              <div className="product-categories">
                <h3>T-SHIRTS</h3>
                <div className="product-grid">
                  <div className="product-card">
                    <ProductPlaceholder width={120} height={120} />
                    <p className="product-card-name">Essentials Classic Tee</p>
                    <div className="product-colors">
                      <span className="color-dot" style={{backgroundColor: '#000'}}></span>
                      <span className="color-dot" style={{backgroundColor: '#fff', border: '1px solid #ddd'}}></span>
                      <span className="color-dot" style={{backgroundColor: '#1e2847'}}></span>
                    </div>
                    <button className="btn-select-product">Select</button>
                  </div>
                </div>

                <h3>HOODIES</h3>
                <div className="product-grid">
                  <div className="product-card">
                    <ProductPlaceholder width={120} height={120} />
                    <p className="product-card-name">Essential Hoodie</p>
                    <div className="product-colors">
                      <span className="color-dot" style={{backgroundColor: '#000'}}></span>
                      <span className="color-dot" style={{backgroundColor: '#666'}}></span>
                    </div>
                    <button className="btn-select-product">Select</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-done" onClick={() => setShowProductModal(false)}>
                DONE
              </button>
            </div>
          </div>
        </>
      )}

      {/* Guidelines Panel */}
      {showGuidelines && (
        <>
          <div className="overlay" onClick={() => setShowGuidelines(false)}></div>
          <div className="guidelines-panel">
            <button className="guidelines-close" onClick={() => setShowGuidelines(false)}>
              &times;
            </button>
            <h2 className="guidelines-title">ARTWORK GUIDELINES</h2>

            <div className="guideline-section">
              <h3>PRINT AREAS & SIZES</h3>
              <p>The maximum print area is 396mm width x 490mm height.</p>
              <p>
                We don't print over edges, seams, or pockets, so the available print areas and
                sizes vary by product.
              </p>
              <p>
                If you add multiple products to a single campaign you'll be limited to the areas
                and sizes that work for all products.
              </p>
            </div>

            <hr />

            <div className="guideline-section">
              <h3>ARTWORK</h3>
              <p>Your artwork should be in PNG format, 300 DPI resolution, and max 10MB.</p>
              <p>
                This is important as anything lower than 300 DPI will not be detailed enough. You
                can check the DPI on Photoshop by selecting 'image', then 'image size'. Bear in
                mind that when a file is exported as a PNG (instead of being re-saved as a PNG) it
                automatically saves at 72 DPI, so be sure to 'save as' (not 'export as') when
                saving from Photoshop.
              </p>
              <p>
                Any colour included in your design (such as white backgrounds, for example) will be
                printed onto your garments.
              </p>
            </div>

            <hr />

            <div className="guideline-section">
              <h3>PRINT METHOD</h3>
              <p>
                Everpress offers several types of printing, including Screen, Direct-to-Garment
                (DTG) and Giclee. The method used is determined by the products you're offering,
                how complex your design is, and how many items you sell.
              </p>
              <p>
                Some designs, such as photography or heavily detailed images, will always be
                digitally printed to a high standard.
              </p>
            </div>

            <hr />

            <div className="guideline-section">
              <h3>MODERATION</h3>
              <p>
                We'll give your design a once-over to check it meets our community guidelines.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UploadArtwork;
