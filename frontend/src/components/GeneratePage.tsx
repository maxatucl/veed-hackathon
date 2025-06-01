import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GeneratePage() {
  const navigate = useNavigate();
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const avatars = [
    { name: 'Alan', img: '/avatars/Alan.jpg' },
    { name: 'Carlos', img: '/avatars/Carlos.jpg' },
    { name: 'Katarina', img: '/avatars/Katarina.jpg' },
    { name: 'Michael', img: '/avatars/Michael.jpg' },
    { name: 'Professor', img: '/avatars/Professor.jpg' },
    { name: 'Peter', img: '/avatars/Peter.jpg' },
    { name: 'Priya', img: '/avatars/Priya.jpg' },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Please upload a video file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    multiple: false
  });

  const onAvatarDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'image/jpeg') {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        await axios.post('http://localhost:5000/upload-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const timestamp = new Date().getTime();
        setCustomAvatarUrl(`http://localhost:5000/avatars/Custom.jpg?t=${timestamp}`);
        setSelectedAvatar('Custom');
      } catch (error) {
        console.error('Avatar upload failed:', error);
        alert('Failed to upload custom avatar. Please try again.');
      }
    } else {
      alert('Please upload a JPG image file');
    }
  }, []);

  const { getRootProps: getAvatarRootProps, getInputProps: getAvatarInputProps, isDragActive: isAvatarDragActive } = useDropzone({
    onDrop: onAvatarDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!video) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('video', video);
    if (language) {
      formData.append('language', language);
    }
    if (selectedAvatar) {
      formData.append('avatar', selectedAvatar);
    }

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful:', response.data);
      // Navigate to result page with the video URL
      navigate('/result', { 
        state: { 
          videoUrl: `http://localhost:5000/video/final_video.mp4`,
          originalVideo: previewUrl
        }
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to generate video. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Avatarcademy</h1>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the video here...</p>
        ) : (
          <p>Drag and drop a video here, or click to select a video</p>
        )}
      </div>

      {/* Language Dropdown */}
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="language-select" style={{ marginRight: '10px' }}>
          Select Language (Optional):
        </label>
        <select
          id="language-select"
          value={language || ''}
          onChange={(e) => setLanguage(e.target.value || null)}
          style={{ padding: '6px 10px', fontSize: '16px', borderRadius: '4px' }}
        >
          <option value="">No translation</option>
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="portuguese">Portuguese</option>
          <option value="mandarin">Mandarin</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="german">German</option>
          <option value="japanese">Japanese</option>
          <option value="arabic">Arabic</option>
          <option value="russian">Russian</option>
          <option value="korean">Korean</option>
          <option value="indonesian">Indonesian</option>
          <option value="italian">Italian</option>
          <option value="dutch">Dutch</option>
          <option value="turkish">Turkish</option>
          <option value="polish">Polish</option>
          <option value="swedish">Swedish</option>
          <option value="tagalog">Tagalog</option>
          <option value="malay">Malay</option>
          <option value="romanian">Romanian</option>
          <option value="ukrainian">Ukrainian</option>
          <option value="greek">Greek</option>
          <option value="czech">Czech</option>
          <option value="danish">Danish</option>
          <option value="finnish">Finnish</option>
          <option value="bulgarian">Bulgarian</option>
          <option value="croatian">Croatian</option>
          <option value="slovak">Slovak</option>
          <option value="tamil">Tamil</option>
          <option value="norwegian">Norwegian</option>
        </select>
      </div>

      <div className="avatar-section">
        <h3>Choose an Avatar</h3>
        <div className="avatar-container">
          <div className="avatar-grid">
            {avatars.map((avatar) => (
              <div
                key={avatar.name}
                className={`avatar-button ${selectedAvatar === avatar.name ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar.name)}
              >
                <img src={`http://localhost:5000/avatars/${avatar.name}.jpg`} alt={avatar.name} />
                <p>{avatar.name}</p>
              </div>
            ))}
            <div
              {...getAvatarRootProps()}
              className={`avatar-button custom-avatar-button ${selectedAvatar === 'Custom' ? 'selected' : ''}`}
            >
              <input {...getAvatarInputProps()} />
              {customAvatarUrl ? (
                <>
                  <img src={customAvatarUrl} alt="Custom" onError={() => {
                    setCustomAvatarUrl(null);
                    setSelectedAvatar(null);
                  }} />
                  <p>Custom Avatar</p>
                </>
              ) : (
                <div className="upload-placeholder">
                  {isAvatarDragActive ? (
                    <p>Drop here...</p>
                  ) : (
                    <>
                      <p>+ Upload Custom</p>
                      <small>(JPG only)</small>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewUrl && (
        <div className="preview">
          <video src={previewUrl} controls width="100%" />
          <button 
            onClick={handleUpload}
            disabled={isLoading || !selectedAvatar}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Processing Video...
              </>
            ) : (
              'Generate Video'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default GeneratePage; 