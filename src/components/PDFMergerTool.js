import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFMergerTool = () => {
  const [allPages, setAllPages] = useState([]);
  const [merging, setMerging] = useState(false);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const newPages = [];
  
    for (const file of files) {
      if (file.type === 'application/pdf') {
        const pdfBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(pdfBytes);
        const pdfJsDoc = await pdfjsLib.getDocument({data: pdfBytes}).promise;
        
        for (let i = 1; i <= pdf.getPageCount(); i++) {
          const page = await pdfJsDoc.getPage(i);
          const viewport = page.getViewport({scale: 0.5});
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({canvasContext: context, viewport: viewport}).promise;
          
          newPages.push({
            id: `page-${Date.now()}-${Math.random()}`,
            fileId: file.name,
            pageNumber: i,
            preview: canvas.toDataURL(),
            type: 'pdf',
            originalData: URL.createObjectURL(file) // Store the original file data
          });
        }
      } else if (file.type.startsWith('image/')) {
        newPages.push({
          id: `page-${Date.now()}-${Math.random()}`,
          fileId: file.name,
          pageNumber: 1,
          preview: URL.createObjectURL(file),
          type: 'image',
          originalData: URL.createObjectURL(file)
        });
      }
    }
    
    setAllPages(prevPages => [...prevPages, ...newPages]);
  };

  const removePage = (id) => {
    setAllPages(prevPages => prevPages.filter(page => page.id !== id));
  };

  const handleMerge = async () => {
    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const page of allPages) {
        try {
          if (page.type === 'pdf') {
            // Instead of using the preview, let's use the original file data
            const pdfBytes = await fetch(page.originalData).then(res => res.arrayBuffer());
            const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const [copiedPage] = await mergedPdf.copyPages(pdf, [page.pageNumber - 1]);
            mergedPdf.addPage(copiedPage);
          } else if (page.type === 'image') {
            const imageBytes = await fetch(page.preview).then(res => res.arrayBuffer());
            let image;
            if (page.fileId.toLowerCase().endsWith('.jpg') || page.fileId.toLowerCase().endsWith('.jpeg')) {
              image = await mergedPdf.embedJpg(imageBytes);
            } else if (page.fileId.toLowerCase().endsWith('.png')) {
              image = await mergedPdf.embedPng(imageBytes);
            } else {
              throw new Error(`Unsupported image format: ${page.fileId}`);
            }
            const newPage = mergedPdf.addPage();
            newPage.drawImage(image, {
              x: 0,
              y: 0,
              width: newPage.getWidth(),
              height: newPage.getHeight(),
              fit: 'contain',
            });
          }
        } catch (pageError) {
          console.error(`Error processing page ${page.pageNumber} of ${page.fileId}:`, pageError);
          // Optionally, you can choose to skip this page and continue with others
          continue;
        }
      }
  
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'merged_document.pdf';
      link.click();
    } catch (error) {
      console.error('Error merging documents:', error);
      alert(`An error occurred while merging: ${error.message}`);
    } finally {
      setMerging(false);
    }
  };

  const onDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.target.style.opacity = '0.5';
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    const newPages = [...allPages];
    const [removed] = newPages.splice(dragIndex, 1);
    newPages.splice(dropIndex, 0, removed);
    setAllPages(newPages);
  };

  return (
    <div className="pdf-merger-tool">
      <h2>PDF Organizer and Merger</h2>
      <div className="file-input-container">
        <label htmlFor="file-input" className="file-input-label">
          <Plus size={20} />
          <span>Add PDFs or Images</span>
        </label>
        <input
          type="file"
          id="file-input"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      <div className="page-organizer">
        {allPages.map((page, index) => (
          <div 
            key={page.id} 
            className="page-item"
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={(e) => onDrop(e, index)}
          >
            <img src={page.preview} alt={`Page ${page.pageNumber} of ${page.fileId}`} />
            <div className="page-controls">
              <span className="page-number">{index + 1}</span>
            </div>
            <button className="delete-page" onClick={() => removePage(page.id)}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={handleMerge} 
        disabled={allPages.length < 1 || merging}
        className="merge-button"
      >
        {merging ? 'Merging...' : 'Merge and Save'}
        <Save size={16} />
      </button>
    </div>
  );
};

export default PDFMergerTool;