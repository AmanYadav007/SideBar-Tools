import React, { useState } from 'react';
import { FileText, Image, Maximize2 } from 'lucide-react';
import PDFMergerTool from './PDFMergerTool';
import ImageCompressorTool from './ImageCompressorTool';
import ImageResizerTool from './ImageResizerTool';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('pdfMerger');

  const renderContent = () => {
    switch(activeTab) {
      case 'pdfMerger':
        return <PDFMergerTool />;
      case 'imageCompressor':
        return <ImageCompressorTool />;
      case 'imageResizer':
        return <ImageResizerTool />;
      default:
        return <PDFMergerTool />;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button onClick={() => setActiveTab('pdfMerger')} className={activeTab === 'pdfMerger' ? 'active' : ''}>
          <FileText size={20} />
        </button>
        <button onClick={() => setActiveTab('imageCompressor')} className={activeTab === 'imageCompressor' ? 'active' : ''}>
          <Image size={20} />
        </button>
        <button onClick={() => setActiveTab('imageResizer')} className={activeTab === 'imageResizer' ? 'active' : ''}>
          <Maximize2 size={20} />
        </button>
      </div>
      <div className="sidebar-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;