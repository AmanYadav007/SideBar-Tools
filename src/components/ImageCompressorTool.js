import React, { useState } from 'react';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const SimpleImageCompressor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionQuality, setCompressionQuality] = useState(70); // Default to 70%
  const [isCompressing, setIsCompressing] = useState(false);

  // Function to format file size
  const formatSize = (size) => {
    if (!size) return '';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setOriginalImage(file);
    setOriginalSize(file.size);
  };

  const handleCompress = async () => {
    if (!originalImage) return;
    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: originalImage.size / 1024 / 1024,
        maxWidthOrHeight: 1920,
        initialQuality: compressionQuality / 100, // Compression quality based on slider value
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(originalImage, options);
      const compressedUrl = await imageCompression.getDataUrlFromFile(compressedFile);
      setCompressedImage(compressedUrl);
      setCompressedSize(compressedFile.size); // Set compressed file size
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_${originalImage.name}`;
    link.click();
  };

  return (
    <div className="image-compressor">
      <h2>Image Compressor</h2>

      {/* Image Upload Section */}
      <div className="upload-container">
        <label htmlFor="image-upload" className="upload-label">
          <Upload size={20} />
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

      {/* Compression Slider */}
      {originalImage && (
        <div className="compression-controls">
          <label>Quality: {compressionQuality}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={compressionQuality}
            onChange={(e) => setCompressionQuality(e.target.value)}
          />
          <button className='compress-button' onClick={handleCompress} disabled={isCompressing}>
            {isCompressing ? 'Compressing...' : 'Compress'}
          </button>
        </div>
      )}

      {/* Image Preview Section */}
      <div className="image-preview">
        {originalImage && (
          <div className="preview-container">
            <div className="original-preview">
              <ImageIcon size={20} />
              <span>Original</span>
              <img src={URL.createObjectURL(originalImage)} alt="Original" />
              <span>{formatSize(originalSize)}</span> {/* Original File Size */}
            </div>
            {compressedImage && (
              <div className="compressed-preview">
                <ImageIcon size={20} />
                <span>Compressed</span>
                <img src={compressedImage} alt="Compressed" />
                <span>{formatSize(compressedSize)}</span> {/* Compressed File Size */}
                <button onClick={handleDownload} className="download-button">
                  <Download size={20} />
                  Download
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageCompressor;
