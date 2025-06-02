from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sieve
from moviepy.editor import VideoFileClip, AudioFileClip
import shutil
from dotenv import dotenv_values
from elevenlabs.client import ElevenLabs
import json
import subprocess
from werkzeug.utils import secure_filename

# Constants
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
AUDIO_FOLDER = "audio"
AVATARS_FOLDER = "avatars"
FOLDERS = [UPLOAD_FOLDER, OUTPUT_FOLDER, AUDIO_FOLDER, AVATARS_FOLDER]

for folder in FOLDERS:
    os.makedirs(folder, exist_ok=True)

# Voice mappings
VOICE_MAPPINGS = {
    "Alan": "openai-echo (no voice cloning)",
    "Carlos": "elevenlabs-alberto (no voice cloning)",
    "Katarina": "openai-nova (no voice cloning)",
    "Michael": "openai-onyx (no voice cloning)",
    "Professor": "sieve-default-cloning",
    "Peter": "openai-echo (no voice cloning)",
    "Priya": "openai-shimmer (no voice cloning)",
    "Custom": "openai-echo (no voice cloning)"
}

app = Flask(__name__)
CORS(app)

# Clean up any existing Custom.jpg on startup
custom_avatar_path = os.path.join(AVATARS_FOLDER, "Custom.jpg")
if os.path.exists(custom_avatar_path):
    try:
        os.remove(custom_avatar_path)
    except Exception as e:
        print(f"Could not remove existing Custom.jpg: {str(e)}")

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Get avatar name first
    avatar_name = request.form.get('avatar', 'Alan')  # Default to 'Alan'

    # Get target language from request (None if not selected)
    target_language = request.form.get('language', None)
    if target_language == '':  # Convert empty string to None
        target_language = None

    # Save the video file
    filename = os.path.join(UPLOAD_FOLDER, video_file.filename)
    video_file.save(filename)

    # Extract audio from the video file
    extract_audio(filename, video_file.filename, target_language, avatar_name)

    # Generate avatar from audio
    avatar_generation(video_file.filename, avatar_name)

    avatar_video_string = OUTPUT_FOLDER + "/" + "generated_avatar.mp4"
    
    # Run your overlay function
    overlay_video(avatar_video_string, filename)
    
    return jsonify({
        'message': 'Video processed successfully',
        'video_url': 'final_video.mp4'
    })

def peter_voice_changer(audio_path):
    config = dotenv_values(".env")
    client = ElevenLabs(
        api_key=config["ELEVENLABS_API_KEY"]
    )
    params = {
        "similarity": 0.0,
        "stability": 0.5,
        "style": 1.0
    }

    voiceChangerResponse = client.speech_to_speech.convert(
        voice_id="73bEoGuG1oV5QCnHySQj",
        output_format="mp3_44100_128",
        model_id="eleven_multilingual_sts_v2",
        audio=open(audio_path, "rb"),
        voice_settings=json.dumps(params),
    )

    with open(audio_path + ".mp3", "wb") as f:
        for x in voiceChangerResponse:
            f.write(x)

def overlay_video(avatar_video_path, background_video_path):
    foreground_video_path = remove_background(avatar_video_path)

    # Define input and output file paths
    output_video = os.path.join(OUTPUT_FOLDER, "final_video.mp4")

    # Construct the FFmpeg filter_complex
    filter_complex = (
        "[1:v]colorkey=0x00FF00:0.3:0.2[ckout];"
        "[0:v]trim=start=0:end=8[cut0];"
        "[cut0][ckout]overlay=x=(W-w-10):y=(H-h-2)[out]"
    )
    print("background_video: " + background_video_path)
    print("foreground_video: " + foreground_video_path)
    print("output_video: " + output_video)

    # Build the full ffmpeg command
    command = [
        "ffmpeg",
        "-y",
        "-i", background_video_path,
        "-i", foreground_video_path,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-map", "1:a",
        output_video
    ]

    # Run the command
    try:
        subprocess.run(command, check=True)
        print("Video compositing complete! Output saved to:", output_video)
        return output_video
    except subprocess.CalledProcessError as e:
        print("Error during FFmpeg execution:", e)
        return None

def remove_background(video_path):
    input_file = sieve.File(path=video_path)

    backend = "parallax"
    background_color_rgb = "0,255,0"
    background_media = sieve.File(url="")
    output_type = "masked_frame"
    video_output_format = "mp4"
    yield_output_batches = False
    start_frame = 0
    end_frame = -1
    vanish_allow_scene_splitting = True

    background_removal = sieve.function.get("sieve/background-removal")
    outputs = background_removal.run(
        input_file = input_file,
        backend = backend,
        background_color_rgb = background_color_rgb,
        background_media = background_media,
        output_type = output_type,
        video_output_format = video_output_format,
        yield_output_batches = yield_output_batches,
        start_frame = start_frame,
        end_frame = end_frame,
        vanish_allow_scene_splitting = vanish_allow_scene_splitting
    )
    output_path = os.path.join(OUTPUT_FOLDER, "avatar_no_background.mp4")
    
    for output_object in outputs:
        # Copy the file from Sieve's output path to our output folder
        shutil.copy2(output_object.path, output_path)
        print(f"copied file to {output_path}")

    return output_path

def extract_audio(video_file, filename, target_language, avatar_name):
    video = VideoFileClip(video_file)
    audio = video.audio
    audio_path = os.path.join(AUDIO_FOLDER, filename + ".wav")

    audio.write_audiofile(audio_path)

    if(avatar_name == "Professor" and target_language is None):
        return
        
    translate_audio(audio_path, target_language, avatar_name)

def translate_audio(audio_path, language, avatar_name):
    source_file = sieve.File(path=audio_path)
    target_language = "english" if language is None else language
    translation_engine = "sieve-default-translator"
    voice_engine = VOICE_MAPPINGS[avatar_name]  # default "sieve-default-cloning"
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

    if avatar_name == "Peter":
        peter_voice_changer(audio_path)
    
def avatar_generation(filename, avatar_name):
    img_path = os.path.join(AVATARS_FOLDER, avatar_name + ".jpg")
    source_image = sieve.File(path=img_path)
    audio_path = os.path.join(AUDIO_FOLDER, filename + ".wav" + (".mp3" if avatar_name == "Peter" else ""))
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

@app.route('/avatars/<path:filename>')
def serve_avatar(filename):
    return send_from_directory(AVATARS_FOLDER, filename)

def find_moment(video_path, query):
    video = sieve.File(path=video_path)
    query = query
    min_clip_length = 3
    start_time = 0
    end_time = -1
    render = True

    moments = sieve.function.get("sieve/moments")
    output = moments.run(
        video = video,
        query = query,
        min_clip_length = min_clip_length,
        start_time = start_time,
        end_time = end_time,
        render = render
    )

    def format_time(seconds):
        minutes = int(seconds) // 60
        secs = int(seconds) % 60
        return f"{minutes}:{secs:02d}"

    start_times = []
    for output_object in output:
        start_times.append(output_object[1]["start_time"])

    if not start_times:
        result = "This topic is not mentioned."
    elif len(start_times) == 1:
        time_str = format_time(start_times[0])
        result = f"This topic is mentioned at time point: {time_str}"
    else:
        formatted_times = [format_time(t) for t in start_times]
        # Join all but last with commas, add 'and' before last
        formatted_str = ", ".join(formatted_times[:-1])
        formatted_str += f" and {formatted_times[-1]}"
        result = f"This topic is mentioned at time points: {formatted_str}"

    return result

def ask_question(video_path, prompt):
    video = sieve.File(path=video_path)
    prompt = prompt
    start_time = 0
    end_time = -1
    backend = "sieve-fast"
    output_schema = {}

    ask = sieve.function.get("sieve/ask")
    output = ask.run(
        video = video,
        prompt = prompt,
        start_time = start_time,
        end_time = end_time,
        backend = backend,
        output_schema = output_schema
    )

    return output

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    user_query = data.get('query', '')

    if os.path.isfile("output/generated_avatar_peter.mp4"):
        video_path = OUTPUT_FOLDER + '/generated_avatar_peter.mp4'
    else:
        video_path = OUTPUT_FOLDER + '/generated_avatar.mp4'
    
    # For now, just echo back the query or you can add real processing logic here
    #response_text = f"You asked: {user_query}"
    response_text = find_moment(video_path, user_query)
    
    return jsonify({'response': response_text})

@app.route('/question', methods=['POST'])
def handle_question():
    data = request.json
    user_prompt = data.get('prompt', '')

    if os.path.isfile("output/generated_avatar_peter.mp4"):
        video_path = OUTPUT_FOLDER + '/generated_avatar_peter.mp4'
    else:
        video_path = OUTPUT_FOLDER + '/generated_avatar.mp4'

    response = ask_question(video_path, user_prompt)
    return jsonify({'response': response})

@app.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({'error': 'No avatar file provided'}), 400
    
    avatar_file = request.files['avatar']
    if avatar_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not avatar_file.filename.lower().endswith('.jpg'):
        return jsonify({'error': 'Only JPG files are allowed'}), 400

    # Secure the filename and save
    filename = secure_filename('Custom.jpg')
    avatar_path = os.path.join(AVATARS_FOLDER, filename)
    avatar_file.save(avatar_path)

    return jsonify({
        'message': 'Avatar uploaded successfully',
        'avatar_name': 'Custom'
    })

if __name__ == '__main__':
    app.run(debug=True) 