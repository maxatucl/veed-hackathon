from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sieve
from moviepy.editor import VideoFileClip
import shutil

app = Flask(__name__)
CORS(app)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)
AUDIO_FOLDER = 'audio'
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)
AVATARS_FOLDER = 'avatars'
if not os.path.exists(AVATARS_FOLDER):
    os.makedirs(AVATARS_FOLDER)

# voice dictionary
voices = {
    "Alan": "openai-echo (no voice cloning)",
    "Carlos": "elevenlabs-alberto (no voice cloning)",
    "Katarina": "openai-nova (no voice cloning)",
    "Michael": "openai-onyx (no voice cloning)",
    "Niloy": "sieve-default-cloning",
    "Peter": "openai-echo (no voice cloning)",
    "Priya": "openai-shimmer (no voice cloning)",
    "Tonya": "openai-alloy (no voice cloning)"
}

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Get target language from request (None if not selected)
    target_language = request.form.get('language', None)
    if target_language == '':  # Convert empty string to None
        target_language = None

    # Save the video file
    filename = os.path.join(UPLOAD_FOLDER, video_file.filename)
    video_file.save(filename)

    # Generate avatar from audio and get the output URL
    avatar_name = request.form.get('avatar', 'Alan')  # Default to 'Alan'
    video_url = avatar_generation(video_file.filename, avatar_name)

    # Extract audio from the video file
    extract_audio(filename, video_file.filename, target_language, avatar_name)
    
    return jsonify({
        'message': 'Video processed successfully',
        'video_url': video_url
    })

def extract_audio(video_file, filename, target_language, avatar_name):
    video = VideoFileClip(video_file)
    audio = video.audio
    audio_path = os.path.join(AUDIO_FOLDER, filename + ".wav")

    audio.write_audiofile(audio_path)

    if(target_language is not None):
        translate_audio(audio_path, target_language, avatar_name)

def translate_audio(audio_path, language, avatar_name):
    source_file = sieve.File(path=audio_path)
    target_language = language
    translation_engine = "sieve-default-translator"
    voice_engine = voices[avatar_name]  # default "sieve-default-cloning"
    transcription_engine = "sieve-transcribe"
    output_mode = "voice-dubbing"
    edit_segments = []
    return_transcript = False
    preserve_background_audio = True
    safewords = ""
    translation_dictionary = ""
    start_time = 0
    end_time = -1
    enable_lipsyncing = False
    lipsync_backend = "sync-2.0"
    lipsync_enhance = "default"

    dubbing = sieve.function.get("sieve/dubbing")
    output = dubbing.run(
        source_file = source_file,
        target_language = target_language,
        translation_engine = translation_engine,
        voice_engine = voice_engine,
        transcription_engine = transcription_engine,
        output_mode = output_mode,
        edit_segments = edit_segments,
        return_transcript = return_transcript,
        preserve_background_audio = preserve_background_audio,
        safewords = safewords,
        translation_dictionary = translation_dictionary,
        start_time = start_time,
        end_time = end_time,
        enable_lipsyncing = enable_lipsyncing,
        lipsync_backend = lipsync_backend,
        lipsync_enhance = lipsync_enhance
    )
    for output_object in output:
        path = output_object.path

        # Copy the file from Sieve's output path to our output folder
        shutil.copy2(path, audio_path)
        print("copied file to " + audio_path)
    
def avatar_generation(filename, avatar_name):
    img_path = os.path.join(AVATARS_FOLDER, avatar_name + ".jpg")
    source_image = sieve.File(path=img_path)
    audio_path = os.path.join(AUDIO_FOLDER, filename + ".wav")
    driving_audio = sieve.File(path=audio_path)
    backend = "hedra-character-2"
    aspect_ratio = "-1"
    enhancement = "none"
    resolution = "512"
    whole_body_mode = True
    crop_head = False
    expressiveness = 1

    portrait_avatar = sieve.function.get("sieve/portrait-avatar")
    output = portrait_avatar.run(
        source_image = source_image,
        driving_audio = driving_audio,
        backend = backend,
        aspect_ratio = aspect_ratio,
        enhancement = enhancement,
        resolution = resolution,
        whole_body_mode = whole_body_mode,
        crop_head = crop_head,
        expressiveness = expressiveness
    )
    
    path = output.path
    
    # Save the output video
    output_filename = 'generated_avatar.mp4'
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    # Copy the file from Sieve's output path to our output folder
    shutil.copy2(path, output_path)
    
    return output_filename

@app.route('/video/<filename>')
def serve_video(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True) 