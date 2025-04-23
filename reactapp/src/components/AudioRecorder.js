// src/components/AudioRecorder.js
import React, { useRef, useState, useEffect } from 'react';
import '../styles/AudioRecorder.css';

const AudioRecorder = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // Start recording
  const startRecording = async () => {
    chunksRef.current = [];
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.addEventListener('stop', handleRecordingStop);
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please ensure microphone permissions are enabled.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
    }
  };
  
  // Handle data chunks as they become available
  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };
  
  // Process recording when stopped
  const handleRecordingStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    setAudioBlob(blob);
    setAudioUrl(url);
    setIsRecording(false);
  };
  
  // Use recorded audio
  const handleSave = () => {
    if (audioBlob && onSave) {
      onSave(audioBlob);
    }
  };
  
  // Discard recording
  const handleDiscard = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  return (
    <div className="audio-recorder">
      {error && <div className="recorder-error">{error}</div>}
      
      <div className="recorder-display">
        {isRecording ? (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
        ) : (
          <div className="recorder-ready">
            {audioUrl ? 'Recording ready' : 'Ready to record'}
          </div>
        )}
      </div>
      
      <div className="recorder-controls">
        {!isRecording && !audioUrl && (
          <button 
            type="button"
            className="start-button"
            onClick={startRecording}
          >
            Start Recording
          </button>
        )}
        
        {isRecording && (
          <button 
            type="button"
            className="stop-button"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        )}
        
        {audioUrl && (
          <div className="playback-controls">
            <audio src={audioUrl} controls></audio>
            
            <div className="recording-actions">
              <button 
                type="button"
                className="discard-button"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button 
                type="button"
                className="save-button"
                onClick={handleSave}
              >
                Use This Recording
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
