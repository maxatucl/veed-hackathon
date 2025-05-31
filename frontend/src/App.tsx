import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const avatars = [
  { name: 'Alan', img: '/avatars/Alan.jpg' },
  { name: 'Carlos', img: '/avatars/Carlos.jpg' },
  { name: 'Katarina', img: '/avatars/Katarina.jpg' },
  { name: 'Michael', img: '/avatars/Michael.jpg' },
  { name: 'Niloy', img: '/avatars/Niloy.jpg' },
  { name: 'Peter', img: '/avatars/Peter.jpg' },
  { name: 'Priya', img: '/avatars/Priya.jpg' },
  { name: 'Tonya', img: '/avatars/Tonya.jpg' },
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

  const handleUpload = async () => {
    if (!video) return;

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
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="App">
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

      <div className="avatar-grid">
        {avatars.map((avatar) => (
          <div
            key={avatar.name}
            className={`avatar-button ${selectedAvatar === avatar.name ? 'selected' : ''}`}
            onClick={() => setSelectedAvatar(avatar.name)}
          >
            <img src={avatar.img} alt={avatar.name} />
            <p>{avatar.name}</p>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div className="preview">
          <video src={previewUrl} controls width="100%" />
          <button onClick={handleUpload}>
            Generate Video
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 