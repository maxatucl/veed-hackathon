import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LocationState {
  videoUrl: string;
  originalVideo: string;
}

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoUrl } = location.state as LocationState;
  
  const [query, setQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [prompt, setPrompt] = useState('');
  const [promptResponse, setPromptResponse] = useState('');

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/query', { query });
      setQueryResponse(res.data.response);
    } catch (error) {
      setQueryResponse('Error contacting server');
      console.error(error);
    }
  };

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

  return (
    <div className="result-page">
      <div className="header">
        <h1>Generated Video</h1>
        <button onClick={() => navigate('/')} className="back-button">
          ← Generate New Video
        </button>
      </div>

      <div className="video-container">
        <video src={videoUrl} controls width="100%" autoPlay />
      </div>

      <div className="interaction-section">
        <div className="interaction-box">
          <h2>Moment Matcher</h2>
          <p>Search for when a particular topic or concept occurred during the video:</p>
          <div className="input-group">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your query here"
              onKeyPress={e => e.key === 'Enter' && handleQuerySubmit()}
            />
            <button onClick={handleQuerySubmit}>Search</button>
          </div>
          {queryResponse && (
            <div className="response">
              <strong>Response:</strong>
              <p>{queryResponse}</p>
            </div>
          )}
        </div>

        <div className="interaction-box">
          <h2>Ask a Question</h2>
          <p>Ask any question related to the video content:</p>
          <div className="input-group">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your question here"
              onKeyPress={e => e.key === 'Enter' && handlePromptSubmit()}
            />
            <button onClick={handlePromptSubmit}>Ask</button>
          </div>
          {promptResponse && (
            <div className="response">
              <strong>Response:</strong>
              <p>{promptResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultPage; 