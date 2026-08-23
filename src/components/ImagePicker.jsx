import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import './ImagePicker.css';

const ImagePicker = ({ value, onChange, multiple = false, label = "Upload Image", aspectRatio = 16 / 9 }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Cropper states
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [bgColor, setBgColor] = useState('white');

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setBgColor('white');
    }
  };

  const uploadToCloudinary = async (fileBlob) => {
    setIsUploading(true);
    try {
      const { data: sigData } = await axiosClient.post('/upload/signature');

      const formData = new FormData();
      formData.append('file', fileBlob);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
        formData
      );

      const uploadedUrl = res.data.secure_url;

      if (multiple) {
        const currentVals = Array.isArray(value) ? value : [];
        onChange([...currentVals, uploadedUrl]);
      } else {
        onChange(uploadedUrl);
      }
      
      toast.success('Upload successful!');
    } catch (error) {
      console.error(error);
      toast.error('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, bgColor);
      await uploadToCloudinary(croppedImageBlob);
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  };

  const removeImage = (indexToRemove) => {
    if (multiple) {
      onChange(value.filter((_, idx) => idx !== indexToRemove));
    } else {
      onChange(null);
    }
  };

  const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  return (
    <div className="image-picker-container">
      <label className="form-label">{label}</label>
      
      <div className="image-picker-grid">
        {images.map((url, idx) => (
          <div key={idx} className="image-preview-card">
            <img src={url} alt={`Preview ${idx}`} />
            <button 
              type="button" 
              className="remove-btn" 
              onClick={() => removeImage(idx)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {(!value || multiple) && (
          <label className="image-upload-dropzone">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <span className="upload-text">Uploading...</span>
            ) : (
              <>
                <Upload size={24} className="upload-icon" />
                <span className="upload-text">Click to browse</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Crop Modal */}
      {imageSrc && createPortal(
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 style={{ marginBottom: '0.5rem' }}>Crop & Resize</h3>

            {/* Background color for padding */}
            <div className="crop-bg-picker">
              <span className="crop-bg-label">Fill Color</span>
              <div className="crop-bg-options">
                <button
                  type="button"
                  className={`crop-bg-btn crop-bg-white${bgColor === 'white' ? ' active' : ''}`}
                  onClick={() => setBgColor('white')}
                  title="White"
                >
                  White
                </button>
                <button
                  type="button"
                  className={`crop-bg-btn crop-bg-black${bgColor === 'black' ? ' active' : ''}`}
                  onClick={() => setBgColor('black')}
                  title="Black"
                >
                  Black
                </button>
              </div>
            </div>

            <div className="cropper-container" style={{ background: bgColor === 'white' ? '#d0d0d0' : '#111' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                minZoom={0.1}
                restrictPosition={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                style={{
                  containerStyle: { background: 'transparent' },
                }}
              />
            </div>
            
            <div className="crop-controls">
              <label>Zoom</label>
              <input
                type="range"
                value={zoom}
                min={0.1}
                max={3}
                step={0.05}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider"
              />
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            </div>

            <div className="crop-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setImageSrc(null)}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleCropSave}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ImagePicker;
