import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('2D Pixar');
  const [notes, setNotes] = useState('');
  const [subjects, setSubjects] = useState([{ race: '', skinTone: '' }]);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const styles = [
    '2D Pixar', 
    '3D Pixar', 
    'Fantasy', 
    'Superhero', 
    'Comic Book', 
    'Studio Ghibli', 
    'Cyber Punk', 
    'Realistic Caricature', 
    'Vintage Poster', 
    'GTA Coverart',
    'Ultra-Realistic',
    'Fauvism',
    'Claymation',
    'Digital',
    'Children\'s Book',
    'Retro Futurism',
    'Retro Comic',
    'LEGO',
    'Grafitti',
    'Pixel Art',
    'Art Deco',
    'Cubism',
    'Surrealism',
    'Expressionism'
  ];

  const backendUrl = 'http://localhost:5001'; // Change to your deployed URL

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { race: '', skinTone: '' }]);
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const handleSubmit = async () => {
    if (!selectedImage || !selectedStyle) return;
    setLoading(true);
    setResultImage(null);

    try {
      const response = await axios.post(`${backendUrl}/api/transform`, {
        image: selectedImage,
        style: selectedStyle,
        notes: notes,
        subjects: subjects
      });
      setResultImage(response.data.imageUrl);
    } catch (error) {
      console.error(error);
      alert("Error generating image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={outerContainerStyle}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: 'Poppins', sans-serif;
            background: var(--background);
            color: var(--text-light);
          }

          :root {
            --primary: #00ADB5;
            --secondary: #222831;
            --background: #393E46;
            --accent: #EEEEEE;
            --text-light: #FFFFFF;
            --text-dark: #222831;
          }

          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: var(--secondary);
          }
          ::-webkit-scrollbar-thumb {
            background: var(--primary);
          }

          @keyframes slide {
            0% { left: -30%; }
            50% { left: 50%; }
            100% { left: 110%; }
          }

          /* Hover and Active States for Buttons and Links */
          .button,
          a.button {
            transition: background 0.3s ease, transform 0.1s ease;
          }

          .button:hover,
          a.button:hover {
            background: #009aa2;
          }

          .button:active,
          a.button:active {
            transform: scale(0.97);
          }
        `}
      </style>

      <div style={containerStyle}>
        <h1 style={headingStyle}>Ai Filter</h1>
        <p style={paragraphStyle}>
          Upload an image, choose a style, add notes, and provide subjects. The subjects are arranged from left to right.
        </p>

        {loading && (
          <div style={loadingBarContainer}>
            <div style={loadingBar}></div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={inputStyle} 
        />

        <select 
          value={selectedStyle} 
          onChange={(e) => setSelectedStyle(e.target.value)} 
          style={selectStyle}
        >
          {styles.map(style => <option key={style} value={style}>{style}</option>)}
        </select>

        <button onClick={handleAddSubject} style={buttonStyle} className="button">Add Subject</button>

        {subjects.map((subject, index) => (
          <div key={index} style={subjectContainer}>
            <h3 style={subjectHeading}>Subject {index + 1}</h3>
            <input
              type="text"
              placeholder="Race (e.g. Black, White, Asian)"
              value={subject.race}
              onChange={(e) => handleSubjectChange(index, 'race', e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Skin Tone (e.g. light brown, fair)"
              value={subject.skinTone}
              onChange={(e) => handleSubjectChange(index, 'skinTone', e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}

        <textarea
          placeholder="Any special notes?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={textareaStyle}
        ></textarea>
        
        <button onClick={handleSubmit} disabled={loading} style={{...buttonStyle, opacity: loading ? 0.7 : 1}} className="button">
          {loading ? 'Transforming...' : 'Transform'}
        </button>

        {resultImage && (
          <div style={resultContainer}>
            <h2 style={headingStyle}>Your Transformed Image</h2>
            <img src={resultImage} alt="transformed" style={resultImageStyle} />
            <div style={resultButtonContainer}>
              <a href={resultImage} download="transformed-image.png" style={linkStyle} className="button">Download</a>
              <button onClick={() => setResultImage(null)} style={buttonStyle} className="button">Try Again</button>
              <button onClick={() => {
                setSelectedImage(null); 
                setResultImage(null); 
                setNotes(''); 
                setSubjects([{ race: '', skinTone: '' }]);
              }} style={buttonStyle} className="button">Upload New Image</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

const outerContainerStyle = {
  display: 'flex', 
  justifyContent: 'center', 
  minHeight: '100vh', 
  background: 'var(--background)', 
  padding: '20px', 
  boxSizing: 'border-box'
};

const containerStyle = {
  maxWidth: '600px', 
  width: '100%', 
  background: 'var(--secondary)', 
  padding: '20px', 
  borderRadius: '10px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  overflow: 'hidden'
};

const headingStyle = {
  marginTop: '0', 
  marginBottom: '10px', 
  color: 'var(--primary)', 
  fontWeight: '600', 
  letterSpacing: '0.5px'
};

const paragraphStyle = {
  marginTop: '0', 
  marginBottom: '20px', 
  lineHeight: '1.5', 
  color: 'var(--text-light)',
  fontSize: '14px'
};

const loadingBarContainer = {
  width: '100%',
  height: '4px',
  backgroundColor: '#2E3338',
  marginBottom: '10px',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '4px'
};

const loadingBar = {
  width: '30%',
  height: '100%',
  backgroundColor: 'var(--primary)',
  animation: 'slide 1.5s infinite',
  position: 'absolute',
  borderRadius: '4px'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '8px',
  marginBottom: '10px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--accent)',
  color: 'var(--text-dark)',
  fontSize: '14px',
  outline: 'none',
  lineHeight: '1.3'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

const buttonStyle = {
  padding: '8px 16px',
  marginBottom: '20px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--primary)',
  color: 'var(--text-light)',
  cursor: 'pointer',
  fontSize: '14px',
  marginRight: '10px',
  fontWeight: '600'
};

const subjectContainer = {
  marginBottom: '10px', 
  border: '1px solid #2E3338', 
  padding: '10px', 
  borderRadius: '8px',
  background: '#2E3338'
};

const subjectHeading = {
  margin: '0 0 10px 0', 
  color: 'var(--text-light)',
  fontWeight: '500',
  fontSize: '14px'
};

const textareaStyle = {
  ...inputStyle,
  height: '60px',
  resize: 'vertical'
};

const resultContainer = {
  textAlign: 'center',
  marginTop: '20px'
};

const resultImageStyle = {
  maxWidth: '100%', 
  borderRadius: '8px',
  marginBottom: '10px'
};

const resultButtonContainer = {
  marginTop: '10px'
};

const linkStyle = {
  ...buttonStyle,
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center'
};
