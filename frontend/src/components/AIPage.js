// frontend/src/components/AIPage.js
import React, { useState } from 'react';

function AIPage() {
  const [info, setInfo] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setResult("");
    if (!info) {
      setError("Please enter some information about yourself.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ info })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate biodata.");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      console.error("AI generate error:", err);
      setError("An error occurred while generating biodata.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>AI-Powered Biodata Generator</h2>
      <p>Enter some details about yourself (e.g., your age, profession, interests) and let the AI generate a brief biodata for you:</p>
      <textarea 
        rows="4" 
        cols="50" 
        value={info} 
        onChange={(e) => setInfo(e.target.value)} 
        placeholder="E.g., 28 years old, engineer, loves painting and cooking, family oriented..."
      ></textarea>
      <br/>
      <button onClick={handleGenerate} style={{ margin: '10px 0' }}>Generate Bio</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '1em', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Your AI-generated Biodata:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default AIPage;
