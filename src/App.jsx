import React, { useState } from 'react';
import './App.css';

// Helper function to ensure the summary is exactly 30 words and feels complete
const formatTo30Words = (text) => {
  const words = text.trim().split(/\s+/);

  if (words.length < 30) {
    return words.join(' ') + (words.length > 0 ? '.' : '');
  }

  let truncatedText = words.slice(0, 30).join(' ');

  
  const lastPeriodIndex = truncatedText.lastIndexOf('.');
  if (lastPeriodIndex > 0 && lastPeriodIndex >= truncatedText.length - 15) {
    truncatedText = truncatedText.slice(0, lastPeriodIndex + 1);
  } else {
   
    const lastFewWords = truncatedText.split(' ').slice(-3).join(' ');
    if (!/[.?!]$/.test(lastFewWords)) {
      truncatedText = truncatedText.replace(/[,;:]?$/, '.') 
    }
  }

  return truncatedText;
};

// Function to call the API and get a summary
const fetchSummary = async (text) => {
  const url = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
  const headers = {
    Authorization: "Bearer ${API_KEY}",
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({ inputs: text });

  try {
    const response = await fetch(url, { method: "POST", headers, body });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return { error: error.message };
  }
};

function App() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setInputText(e.target.value);

  const handleSummarize = async () => {
    if (!inputText) return;

    setLoading(true);
    setSummary("");

    const response = await fetchSummary(inputText);

    setLoading(false);
    setInputText(""); 

    if (response.error) {
      setSummary("Failed to summarize text. Please try again.");
    } else {
      
      const summaryText = response[0]?.summary_text || "No summary generated.";
      setSummary(formatTo30Words(summaryText));
    }
  };

  return (
    <div className="App">
      <h1>Sentence Summarizer</h1>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter your Sentence here..."
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      <div className="summary">
        {loading ? (
          <div className="loader"></div>
        ) : (
          summary && (
            <>
              <h2>Summary:</h2>
              <p>{summary}</p>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default App;
