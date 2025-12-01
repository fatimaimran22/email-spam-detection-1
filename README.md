# Spam Detection Web Application

A modern, client-side React application that trains a Multinomial Naive Bayes spam detection model in the browser and allows users to test email/SMS messages in real-time.

## Features

- 🤖 **In-Browser ML Training**: Trains a Naive Bayes model directly in the browser using JavaScript
- ⚡ **Fast & Responsive**: Built with React and Vite for optimal performance
- 🎨 **Modern UI**: Beautiful, card-based design with Tailwind CSS
- 📊 **Confidence Scores**: Shows prediction confidence percentage
- 🧪 **Sample Messages**: Pre-filled sample spam and ham messages for testing
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PapaParse** - CSV parsing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## How It Works

1. **Data Loading**: On page load, the app fetches the spam dataset from GitHub
2. **Training**: The Multinomial Naive Bayes algorithm trains on the dataset
3. **Prediction**: Users can input messages and get real-time spam/ham predictions with confidence scores

## Algorithm

The app implements Multinomial Naive Bayes with:
- Text tokenization (lowercase, alphanumeric)
- Word frequency counting for spam/ham categories
- Laplace smoothing for handling unseen words
- Log probability calculations to prevent underflow
- Confidence scoring based on posterior probabilities

## Project Structure

```
├── src/
│   ├── hooks/
│   │   └── useSpamModel.js    # Naive Bayes implementation & training logic
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind CSS imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## License

MIT

