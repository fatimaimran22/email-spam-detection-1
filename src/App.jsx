import { useState } from 'react';
import { useSpamModel } from './hooks/useSpamModel';
import { Shield, AlertTriangle, CheckCircle, Loader2, RefreshCw, Mail } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const { predict, isTraining, trainingProgress, isReady, error, retrain } = useSpamModel();

  // Sample messages
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
    if (!result || result.error) return 'bg-gray-100 text-gray-800';
    return result.label === 'spam' 
      ? 'bg-red-50 border-red-200 text-red-900' 
      : 'bg-green-50 border-green-200 text-green-900';
  };

  const getResultIcon = () => {
    if (!result || result.error) return null;
    return result.label === 'spam' 
      ? <AlertTriangle className="w-6 h-6" /> 
      : <CheckCircle className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Spam Detection</h1>
          </div>
          <p className="text-gray-600 text-lg">
            
          </p>
        </div>

        {/* Training Status Card */}
        {isTraining && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <h2 className="text-lg font-semibold text-gray-800">Training Model...</h2>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {Math.round(trainingProgress)}% complete - Processing dataset...
            </p>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-red-800">Training Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={retrain}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Training
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border border-gray-200">
          {/* Input Section */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Enter Email or SMS Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setResult(null);
              }}
              placeholder="Type or paste your message here..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              disabled={!isReady}
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {message.length} characters
              </p>
              {isReady && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Model ready
                </p>
              )}
            </div>
          </div>

          {/* Check Button */}
          <button
            onClick={handleCheck}
            disabled={!isReady || isTraining}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-transform"
          >
            {isReady ? 'Check Message' : 'Training Model...'}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div className={`bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border-2 ${getResultColor()}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getResultIcon()}
              </div>
              <div className="flex-1">
                {result.error ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Error</h3>
                    <p>{result.error}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {result.label === 'spam' ? '🚨 Spam Detected!' : '✅ Legitimate Message'}
                    </h3>
                    <p className="text-lg mb-3">
                      This message is classified as <strong>{result.label.toUpperCase()}</strong>
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 inline-block">
                      <p className="text-sm font-medium">
                        Confidence: <span className="font-bold">{Math.round(result.confidence * 100)}%</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sample Messages Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Spam Samples */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Sample Spam Messages
            </h3>
            <div className="space-y-2">
              {sampleSpam.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample)}
                  disabled={!isReady}
                  className="w-full text-left px-4 py-2 text-sm bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Ham Samples */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Sample Legitimate Messages
            </h3>
            <div className="space-y-2">
              {sampleHam.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample)}
                  disabled={!isReady}
                  className="w-full text-left px-4 py-2 text-sm bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy;Fatima Imran,  Umme Aiman,  Muhammad Umer</p>
        </div>
      </div>
    </div>
  );
}

export default App;

