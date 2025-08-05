from flask import Blueprint, render_template, request, jsonify, current_app
import os
import subprocess
import azure.cognitiveservices.speech as speechsdk
import google.generativeai as genai

translator_bp = Blueprint('translator_bp', __name__)

@translator_bp.route('/translator')
def translator():
    return render_template('translator.html')

def speech_to_text(audio_data, source_lang):
    """Uses Azure Speech-to-Text to recognize speech from audio data."""
    speech_key = current_app.config['AZURE_SPEECH_KEY']
    speech_region = current_app.config['AZURE_SPEECH_REGION']
    
    print(f"Azure Speech Key: {speech_key[:5]}... (truncated)")
    print(f"Azure Speech Region: {speech_region}")
    if not speech_key or not speech_region:
        raise ValueError("Azure Speech credentials are not configured.")

    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
    speech_config.speech_recognition_language = source_lang
    
    # Use a WAV file format for recognition.
    audio_config = speechsdk.audio.AudioConfig(filename=audio_data)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    result = speech_recognizer.recognize_once()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        return "(無法辨識語音)"
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"Speech Recognition canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"Error details: {cancellation_details.error_details}")
        return "(語音辨識錯誤)"
    return "(語音辨識失敗)"

def translate_text_with_gemini(text, source_lang, target_lang):
    """Uses Google Gemini to translate text."""
    api_key = current_app.config['GEMINI_API_KEY']
    if not api_key:
        raise ValueError("Gemini API key is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash-lite')

    # Language name mapping for a better prompt
    lang_map = {
        'zh-TW': '繁體中文',
        'en-US': '英文',
        'ja-JP': '日文'
    }

    prompt = f"請將以下內容從「{lang_map.get(source_lang, source_lang)}」翻譯成「{lang_map.get(target_lang, target_lang)}」，請只回傳翻譯後的結果，不要包含任何額外的說明或文字.\n\n原文:\n{text}"

    response = model.generate_content(prompt)
    return response.text.strip()


@translator_bp.route('/api/translate-audio', methods=['POST'])
def translate_audio():
    if 'audio_data' not in request.files:
        return jsonify({"error": "No audio file part"}), 400
    
    file = request.files['audio_data']
    source_lang = request.form.get('source_lang')
    target_lang = request.form.get('target_lang')

    if not all([file, source_lang, target_lang]):
        return jsonify({"error": "Missing data"}), 400

    mp4_path = None
    wav_path = None
    try:
        # 1. Save the uploaded mp4 file temporarily
        mp4_path = "temp_recording.mp4"
        file.save(mp4_path)

        # 2. Convert mp4 to wav using ffmpeg
        wav_path = "temp_recording.wav"
        # This command converts the mp4 to a 16-bit PCM WAV file, which is what Azure SDK expects
        command = f"ffmpeg -i {mp4_path} -acodec pcm_s16le -ar 16000 -ac 1 {wav_path} -y"
        subprocess.run(command, shell=True, check=True)

        # 3. Speech to Text from the converted WAV file
        original_text = speech_to_text(wav_path, source_lang)
        print(f"Original Text (from STT): {original_text}")
        
        if original_text.startswith('('): # Handle STT errors
            return jsonify({"original_text": original_text, "translated_text": ""})

        # 4. Translate Text
        translated_text = translate_text_with_gemini(original_text, source_lang, target_lang)
        print(f"Translated Text (from Gemini): {translated_text}")

        return jsonify({
            "original_text": original_text,
            "translated_text": translated_text
        })

    except subprocess.CalledProcessError as e:
        print(f"ffmpeg conversion failed: {e}")
        return jsonify({"error": "Audio conversion failed."}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        # 5. Clean up temporary files
        if mp4_path and os.path.exists(mp4_path):
            os.remove(mp4_path)
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)
