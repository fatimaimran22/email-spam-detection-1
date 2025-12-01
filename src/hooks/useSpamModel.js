import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

/**
 * Multinomial Naive Bayes implementation for spam detection
 */
class NaiveBayesSpamDetector {
  constructor() {
    this.spamWordCounts = {};
    this.hamWordCounts = {};
    this.spamTotalWords = 0;
    this.hamTotalWords = 0;
    this.spamMessages = 0;
    this.hamMessages = 0;
    this.vocabulary = new Set();
    this.isTrained = false;
  }

  /**
   * Tokenize text into words (lowercase, alphanumeric only)
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Train the model with spam/ham messages
   */
  train(messages, labels) {
    // Reset counts
    this.spamWordCounts = {};
    this.hamWordCounts = {};
    this.spamTotalWords = 0;
    this.hamTotalWords = 0;
    this.spamMessages = 0;
    this.hamMessages = 0;
    this.vocabulary = new Set();

    // Count words in each category
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const label = labels[i];
      const tokens = this.tokenize(message);

      if (label === 'spam' || label === 1) {
        this.spamMessages++;
        tokens.forEach(token => {
          this.spamWordCounts[token] = (this.spamWordCounts[token] || 0) + 1;
          this.spamTotalWords++;
          this.vocabulary.add(token);
        });
      } else {
        this.hamMessages++;
        tokens.forEach(token => {
          this.hamWordCounts[token] = (this.hamWordCounts[token] || 0) + 1;
          this.hamTotalWords++;
          this.vocabulary.add(token);
        });
      }
    }

    this.isTrained = true;
  }

  /**
   * Calculate log probability of a word given a category (with Laplace smoothing)
   */
  getWordProbability(word, isSpam) {
    const alpha = 1; // Laplace smoothing parameter
    const vocabSize = this.vocabulary.size;

    if (isSpam) {
      const count = (this.spamWordCounts[word] || 0) + alpha;
      const total = this.spamTotalWords + alpha * vocabSize;
      return Math.log(count / total);
    } else {
      const count = (this.hamWordCounts[word] || 0) + alpha;
      const total = this.hamTotalWords + alpha * vocabSize;
      return Math.log(count / total);
    }
  }

  /**
   * Predict if a message is spam or ham
   * Returns: { label: 'spam' | 'ham', confidence: number (0-1) }
   */
  predict(text) {
    if (!this.isTrained) {
      throw new Error('Model not trained yet');
    }

    const tokens = this.tokenize(text);
    if (tokens.length === 0) {
      return { label: 'ham', confidence: 0.5 };
    }

    // Prior probabilities
    const totalMessages = this.spamMessages + this.hamMessages;
    const logP_spam = Math.log(this.spamMessages / totalMessages);
    const logP_ham = Math.log(this.hamMessages / totalMessages);

    // Calculate log probabilities for each word
    let logProbSpam = logP_spam;
    let logProbHam = logP_ham;

    tokens.forEach(token => {
      logProbSpam += this.getWordProbability(token, true);
      logProbHam += this.getWordProbability(token, false);
    });

    // Convert log probabilities to regular probabilities
    // Use log-sum-exp trick to avoid underflow
    const maxLog = Math.max(logProbSpam, logProbHam);
    const expSpam = Math.exp(logProbSpam - maxLog);
    const expHam = Math.exp(logProbHam - maxLog);
    const sumExp = expSpam + expHam;

    const probSpam = expSpam / sumExp;
    const probHam = expHam / sumExp;

    const label = probSpam > probHam ? 'spam' : 'ham';
    const confidence = label === 'spam' ? probSpam : probHam;

    return { label, confidence };
  }
}

/**
 * Custom hook for spam detection model
 */
export function useSpamModel() {
  const [model, setModel] = useState(new NaiveBayesSpamDetector());
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch and parse CSV data
   */
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Apaulgithub/oibsip_taskno4/main/spam.csv'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch dataset');
      }
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error('Failed to parse CSV: ' + results.errors[0].message));
              return;
            }
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (err) {
      throw new Error('Failed to fetch data: ' + err.message);
    }
  }, []);

  /**
   * Train the model with fetched data
   */
  const trainModel = useCallback(async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setError(null);
    setIsReady(false);

    try {
      // Fetch data
      setTrainingProgress(10);
      const data = await fetchData();

      // Process data
      setTrainingProgress(30);
      const messages = [];
      const labels = [];

      data.forEach((row, index) => {
        if (row.v1 && row.v2) {
          // Map 'ham'/'spam' to labels, handle both string and numeric
          const label = row.v1.toLowerCase().trim();
          if (label === 'spam' || label === 'ham') {
            messages.push(row.v2);
            labels.push(label);
          }
        }

        // Update progress
        if (index % 100 === 0) {
          setTrainingProgress(30 + (index / data.length) * 50);
        }
      });

      if (messages.length === 0) {
        throw new Error('No valid data found in CSV');
      }

      // Train model
      setTrainingProgress(80);
      const newModel = new NaiveBayesSpamDetector();
      newModel.train(messages, labels);

      setModel(newModel);
      setTrainingProgress(100);
      setIsReady(true);
    } catch (err) {
      setError(err.message);
      console.error('Training error:', err);
    } finally {
      setIsTraining(false);
    }
  }, [fetchData]);

  /**
   * Auto-train on mount
   */
  useEffect(() => {
    trainModel();
  }, [trainModel]);

  /**
   * Predict function
   */
  const predict = useCallback((text) => {
    if (!isReady) {
      return { label: 'ham', confidence: 0, error: 'Model not ready' };
    }
    if (!text || text.trim().length === 0) {
      return { label: 'ham', confidence: 0, error: 'Please enter a message' };
    }
    try {
      return model.predict(text);
    } catch (err) {
      return { label: 'ham', confidence: 0, error: err.message };
    }
  }, [model, isReady]);

  return {
    predict,
    isTraining,
    trainingProgress,
    isReady,
    error,
    retrain: trainModel
  };
}

