# STUDY HELPER

General idea: help students prepare for exams and review content

Focus: increasing attention for understanding Content

Input: .mp4 recording of slides and a Professor speaking over them (like a zoom recording but without the Video recording of the Talking prof)
Output: Lecture hall style recording with interactable Avatar/prof

Features:
- Classroom reconstruction
- ⁠multiple view options
- Translation and lipsyncing
- ⁠Avatar generation / selection (with subway surfer option)
- ⁠Checkpoint questions (with option to chose how often/when)
- OR interactive Questions? Can ask Professor/Avatar and get a response

## Requirements
Create a file named `.env` in the `backend` folder and add your elevenLabs API key to it as `ELEVENLABS_API_KEY=*insert API key here*`

Make sure following python3 packages are installed:

```python
flask
flask-cors
python-dotenv
werkzeug
```

```bash
pip install sievedata
pip install moviepy==1.0.3
pip install elevenlabs
```

## Installation
1. Clone & Navigate to Repo

```bash
cd frontend
npm install
npm install react-scripts
npm install react-router-dom
npm start

cd ../backend
python app.py

sieve login
*enter API key*
```
