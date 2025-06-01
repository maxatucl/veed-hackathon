import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')

  const [prompt, setPrompt] = useState('');
  const [promptResponse, setPromptResponse] = useState('');

  const avatars = [
  { name: 'Alan', img: '/avatars/Alan.jpg' },
  { name: 'Carlos', img: '/avatars/Carlos.jpg' },
  { name: 'Katarina', img: '/avatars/Katarina.jpg' },
  { name: 'Michael', img: '/avatars/Michael.jpg' },
  { name: 'Professor', img: '/avatars/Professor.jpg' },
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
        
        // Create a URL for preview and force a cache-busting timestamp
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

  const handleQuerySubmit = async () => {
    if (!query.trim()) return

    try {
      const res = await axios.post('http://localhost:5000/query', { query })
      setResponse(res.data.response)
    } catch (error) {
      setResponse('Error contacting server')
      console.error(error)
    }
  }

  const handlePromptSubmit = async () => {
  if (!prompt.trim()) return;

  try {
    const res = await axios.post('http://localhost:5000/question', { prompt });
    setPromptResponse(res.data.response);
  } catch (error) {
    setPromptResponse('Error contacting server');
    console.error(error);
  }
};


  const handleUpload = async () => {
    if (!video) return;

    setIsLoading(true);
    setGeneratedVideoUrl(null);

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
      setGeneratedVideoUrl(`http://localhost:5000/video/final_video.mp4`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsLoading(false);
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
          </div>

          <div className="avatar-divider">
            <span>OR</span>
          </div>

          <div
            {...getAvatarRootProps()}
            className={`custom-avatar-dropzone ${selectedAvatar === 'Custom' ? 'selected' : ''}`}
          >
            <input {...getAvatarInputProps()} />
            {customAvatarUrl ? (
              <>
                <img 
                  src={customAvatarUrl} 
                  alt="Custom" 
                  onError={() => {
                    setCustomAvatarUrl(null);
                    setSelectedAvatar(null);
                  }}
                />
                <p>Custom Avatar</p>
              </>
            ) : (
              <div className="upload-placeholder">
                {isAvatarDragActive ? (
                  <p>Drop your avatar here...</p>
                ) : (
                  <>
                    <p>+ Upload Custom Avatar</p>
                    <small>(JPG only)</small>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Moment Matcher</h2>
        <h4>Search for when a particular topic or concept occurred during the video:</h4>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter your query here"
          style={{ width: '80%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #aaa' }}
        />
        <button
          onClick={handleQuerySubmit}
          style={{ marginLeft: 10, padding: '8px 16px', fontSize: 16, borderRadius: 4 }}
        >
          Submit
        </button>
        {response && (
          <div style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
            <strong>Response:</strong> {response}
          </div>
        )}

        <hr style={{ margin: '40px 0' }} />

        <h2>Ask a Question</h2>
        <h4>Ask any question related to the video content:</h4>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter your question here"
          style={{ width: '80%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #aaa' }}
        />
        <button
          onClick={handlePromptSubmit}
          style={{ marginLeft: 10, padding: '8px 16px', fontSize: 16, borderRadius: 4 }}
        >
          Submit
        </button>
        {promptResponse && (
          <div style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
            <strong>Response:</strong> {promptResponse}
          </div>
        )}
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
          {generatedVideoUrl && !isLoading && (
            <div className="generated-video">
              <h3>Generated Video:</h3>
              <video 
                src={generatedVideoUrl} 
                controls 
                width="100%"
                key={generatedVideoUrl}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 