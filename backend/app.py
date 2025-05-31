from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the video file
    filename = os.path.join(UPLOAD_FOLDER, video_file.filename)
    video_file.save(filename)
    
    return jsonify({
        'message': 'Video uploaded successfully',
        'filename': video_file.filename
    })

if __name__ == '__main__':
    app.run(debug=True) 