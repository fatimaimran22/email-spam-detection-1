import { useState } from 'react';
import { useSpamModel } from './hooks/useSpamModel';
import { Shield, AlertTriangle, CheckCircle, Loader2, RefreshCw, Mail } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const { predict, isTraining, trainingProgress, isReady, error, retrain } = useSpamModel();

  const sampleSpam = [
    'Win a free iPhone! Click here now!',
    'Congratulations! You have won $1000. Claim your prize now!',
    'URGENT: Your account will be closed. Verify now: http://fake-link.com',
    'Free tickets for IPL! Limited time offer. Reply STOP to opt out.',
    'You have been selected! Claim your prize: www.win-now.com'
  ];

  const sampleHam = [
    'Hey, are we still meeting for lunch tomorrow?',
    'Thanks for the email. I will review it and get back to you.',
    'Can you send me the report by end of day?',
    'See you at the conference next week.',
    'The meeting has been rescheduled to 3 PM.'
  ];

  const handleCheck = () => {
    if (!message.trim()) {
      setResult({ error: 'Please enter a message to check' });
      return;
    }

    const prediction = predict(message);
    setResult(prediction);
  };

  const handleSampleClick = (sampleText) => {
    setMessage(sampleText);
    setResult(null);
  };

  const getResultColor = () => {
    if (!result || result.error) return '';
    return result.label === 'spam' ? 'result-spam' : 'result-ham';
  };

  const getResultIcon = () => {
    if (!result || result.error) return null;
    return result.label === 'spam' 
      ? <AlertTriangle className="w-6 h-6" /> 
      : <CheckCircle className="w-6 h-6" />;
  };

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="header-section">
          <div className="header-box">
            <div className="icon-box">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="main-title">
              Spam Detector
            </h1>
          </div>
          <p className="small-text">
          Check if your email or SMS is spam. Paste your message below to analyze it.
            
          </p>
        </div>

        {isTraining && (
          <div className="training-card">
            <div className="training-header">
              <div className="training-icon-box">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
              <h2>Training the model...</h2>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round(trainingProgress)}% complete - Processing dataset...
            </p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <div className="error-header">
              <div className="error-icon-box">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="error-title">Error</h2>
            </div>
            <p className="error-message">{error}</p>
            <button
              onClick={retrain}
              className="error-button"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        <div className="input-card">
          <div className="mb-8">
            <label htmlFor="message" className="input-label">
              <div className="label-content">
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>Enter your email or SMS message</span>
              </div>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setResult(null);
              }}
              placeholder="Paste your message here or type something to test..."
              className="text-input"
              disabled={!isReady}
            />
            <div className="input-info">
              <p className="char-count">
                {message.length} characters
              </p>
              {isReady && (
                <p className="ready-status">
                  <CheckCircle className="w-4 h-4" />
                  Model ready
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!isReady || isTraining}
            className="main-button"
          >
            {isReady ? 'Check Message' : 'Training Model...'}
          </button>
        </div>

        {result && (
          <div className={`result-card ${getResultColor()} animate-fade-in`}>
            <div className="result-content">
              <div className="result-icon-box">
                <div className={result.label === 'spam' ? 'icon-bg-red' : 'icon-bg-green'}>
                  {getResultIcon()}
                </div>
              </div>
              <div className="flex-1">
                {result.error ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#475569' }}>Error</h3>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>{result.error}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="result-title">
                      {result.label === 'spam' ? 'Spam Detected' : 'Legitimate Message'}
                    </h3>
                    <p className="result-text">
                      This message is classified as <strong className="text-xl text-gray-900">{result.label.toUpperCase()}</strong>
                    </p>
                    <div className="confidence-box">
                      <p className="confidence-text">
                        Confidence Level: <span className="confidence-value">{Math.round(result.confidence * 100)}%</span>
                      </p>
                      <p className="confidence-subtext">
                        {result.confidence > 0.8 ? 'Very confident' : result.confidence > 0.6 ? 'Pretty confident' : 'Moderate confidence'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="samples-grid">
          <div className="sample-card sample-card-red">
            <div className="sample-header">
              <div className="sample-icon-box sample-icon-box-red">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="sample-title">Try These Spam Examples</h3>
            </div>
            <p className="sample-description">Click to test with spam messages</p>
            <div className="sample-buttons">
              {sampleSpam.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample)}
                  disabled={!isReady}
                  className="sample-button sample-button-red"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="sample-card sample-card-green">
            <div className="sample-header">
              <div className="sample-icon-box sample-icon-box-green">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="sample-title">Try These Normal Messages</h3>
            </div>
            <p className="sample-description">Click to test with legitimate messages</p>
            <div className="sample-buttons">
              {sampleHam.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample)}
                  disabled={!isReady}
                  className="sample-button sample-button-green"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="footer">
          <p className="footer-text">
            Made by: <span className="text-indigo-600">Fatima Imran</span>, <span className="text-blue-600">Umme Aiman</span>, <span className="text-gray-700">Muhammad Umer</span>
          </p>
          <p className="footer-small">
            A machine learning project for spam detection
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

