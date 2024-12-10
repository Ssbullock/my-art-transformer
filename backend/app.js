const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 5001;

app.post('/api/transform', async (req, res) => {
  const { image, style, notes, subjects } = req.body;
  
  if (!image || !style || !subjects || subjects.length === 0) {
    return res.status(400).json({ error: 'Image, style, and at least one subject are required.' });
  }

  try {
    // Construct a description of subjects from left to right
    // Example: "Subject 1: Race = Black, Skin Tone = light brown; Subject 2: Race = White, Skin Tone = fair"
    const subjectsDescription = subjects.map((subj, i) => {
      const raceDesc = subj.race ? `Race = ${subj.race}` : `Race = not provided`;
      const toneDesc = subj.skinTone ? `Skin Tone = ${subj.skinTone}` : `Skin Tone = not provided`;
      return `Subject ${i+1}: ${raceDesc}, ${toneDesc}`;
    }).join('; ');

    // Vision API prompt: We inform the model that these subjects are arranged left to right and the user provided their attributes
    const visionPayload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Describe this image in extreme detail. The following subjects appear from left to right in the image and the user provides their attributes: ${subjectsDescription}. Include these details in the description. describe this Image in lenghty detail.`
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    const visionResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      visionPayload,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const detailedDescription = visionResponse.data.choices[0].message.content;
    //console.log("Detailed description from Vision API:", detailedDescription);
   

    // DALL·E prompt: Include the subjects and their order again, plus the detailed description
    const dallePrompt = `
      Create an image in the style of ${style} based on the following scene:
      ${detailedDescription}
      Additional notes: ${notes}
      Reflect all provided attributes accurately. Ensure that this image is in the sytle of ${style}
    `;
    console.log("Dalle prompt:", dallePrompt);

    const dalleResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = dalleResponse.data.data[0].url;
    return res.json({ imageUrl });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Error processing image' });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

