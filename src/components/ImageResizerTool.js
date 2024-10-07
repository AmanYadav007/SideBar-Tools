import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Lock, Unlock } from 'lucide-react';

const ImageResizerTool = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [aspectRatio, setAspectRatio] = useState(null);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = selectedImage;
    }
  }, [selectedImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    if (maintainAspectRatio && aspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    if (maintainAspectRatio && aspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleResize = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = parseInt(width);
      canvas.height = parseInt(height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setResizedImage(canvas.toDataURL());
    };
    img.src = selectedImage;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = 'resized_image.png';
    link.click();
  };

  const toggleAspectRatio = () => {
    setMaintainAspectRatio(!maintainAspectRatio);
  };

  return (
    <div className="image-resizer-tool">
      <h2>Image Resizer Tool</h2>
      <div className="upload-container">
        <label htmlFor="image-upload" className="upload-label">
          <Upload size={30} />
          <span>Upload Image</span>
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {selectedImage && (
        <div className="resize-controls">
          <div className="dimension-inputs">
            <input
              type="number"
              placeholder="Width"
              value={width}
              onChange={handleWidthChange}
              className="dimension-input"
            />
            <input
              type="number"
              placeholder="Height"
              value={height}
              onChange={handleHeightChange}
              className="dimension-input"
            />
            <button onClick={toggleAspectRatio} className="aspect-ratio-button">
              {maintainAspectRatio ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>
          <button onClick={handleResize} className="resize-button">
            Resize
          </button>
        </div>
      )}

      <div className="image-preview">
        {selectedImage && (
          <img src={selectedImage} alt="Original" className="original-image" />
        )}
        {resizedImage && (
          <div className="resized-image-container">
            <img src={resizedImage} alt="Resized" className="resized-image" />
            <button onClick={handleDownload} className="download-button">
              <Download size={30} />
              Download
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageResizerTool;
