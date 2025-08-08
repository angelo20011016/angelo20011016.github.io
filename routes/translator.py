from flask import Blueprint, render_template, current_app, request
from flask_socketio import emit
import azure.cognitiveservices.speech as speechsdk
import google.generativeai as genai
import base64
import os
import uuid

from app import socketio

translator_bp = Blueprint('translator_bp', __name__)

# In-memory session management for translation streams
# In a production environment, consider a more robust solution like Redis
user_sessions = {}

class TranslationSession:
    def __init__(self, source_lang, target_lang, sid, app):
        self.sid = sid
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.push_stream = speechsdk.audio.PushAudioInputStream()
        self.recognized_text = ""
        self.translated_text = ""
        self.app = app

        # --- Azure Speech-to-Text (STT) Setup ---
        with self.app.app_context():
            speech_key = current_app.config['AZURE_SPEECH_KEY']
            speech_region = current_app.config['AZURE_SPEECH_REGION']
            speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
            speech_config.speech_recognition_language = source_lang
            audio_config = speechsdk.audio.AudioConfig(stream=self.push_stream)
            self.speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        # --- Connect STT events ---
        self.speech_recognizer.recognizing.connect(self.on_recognizing)
        self.speech_recognizer.recognized.connect(self.on_recognized)
        self.speech_recognizer.session_stopped.connect(self.on_session_stopped)
        self.speech_recognizer.canceled.connect(self.on_canceled)

    def start(self):
        self.speech_recognizer.start_continuous_recognition()
        print(f"[{self.sid}] Continuous recognition started.")

    def stop(self):
        self.speech_recognizer.stop_continuous_recognition()
        self.push_stream.close()
        print(f"[{self.sid}] Continuous recognition stopped.")

    def on_recognizing(self, evt):
        # Intermediate results
        if evt.result.text:
            print(f"[{self.sid}] RECOGNIZING: {evt.result.text}")
            socketio.emit('recognizing_text', {'text': evt.result.text}, room=self.sid)

    def on_recognized(self, evt):
        # Final result for a phrase
        if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
            full_sentence = evt.result.text
            print(f"[{self.sid}] RECOGNIZED: {full_sentence}")
            self.recognized_text += full_sentence + " "
            socketio.emit('recognized_text', {'text': self.recognized_text.strip()}, room=self.sid)
            self.translate_and_synthesize(full_sentence)
        elif evt.result.reason == speechsdk.ResultReason.NoMatch:
            print(f"[{self.sid}] NOMATCH: Speech could not be recognized.")

    def on_session_stopped(self, evt):
        print(f"[{self.sid}] Session stopped.")
        self.stop()

    def on_canceled(self, evt):
        print(f"[{self.sid}] Canceled: {evt.reason}")
        if evt.reason == speechsdk.CancellationReason.Error:
            print(f"[{self.sid}] Error details: {evt.error_details}")
        self.stop()

    def translate_and_synthesize(self, text_to_translate):
        with self.app.app_context():
            try:
                # 1. Translate Text with Gemini
                translated = self.translate_text_with_gemini(text_to_translate)
                self.translated_text += translated + " "
                socketio.emit('translated_text', {'text': self.translated_text.strip()}, room=self.sid)

                # 2. Synthesize Speech with Azure
                audio_base64 = self.text_to_speech(translated)
                if audio_base64:
                    socketio.emit('translation_audio', {'audio': audio_base64}, room=self.sid)

            except Exception as e:
                print(f"[{self.sid}] Error in translation/synthesis: {e}")
                socketio.emit('translation_error', {'error': str(e)}, room=self.sid)

    def translate_text_with_gemini(self, text):
        api_key = current_app.config['GEMINI_API_KEY']
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        lang_map = {'zh-TW': '繁體中文', 'en-US': '英文', 'ja-JP': '日文'}
        prompt = f"請將以下內容從「{lang_map.get(self.source_lang, self.source_lang)}」翻譯成「{lang_map.get(self.target_lang, self.target_lang)}」，請只回傳翻譯後的結果，不要包含任何額外的說明或文字.\n\n原文:\n{text}"
        response = model.generate_content(prompt)
        return response.text.strip()

    def text_to_speech(self, text):
        speech_key = current_app.config['AZURE_SPEECH_KEY']
        speech_region = current_app.config['AZURE_SPEECH_REGION']
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
        
        voice_map = {
            'zh-TW': "zh-TW-HsiaoChenNeural",
            'en-US': "en-US-JennyNeural",
            'ja-JP': "ja-JP-NanamiNeural"
        }
        speech_config.speech_synthesis_voice_name = voice_map.get(self.target_lang, "en-US-JennyNeural")
        speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm)

        speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
        result = speech_synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return base64.b64encode(result.audio_data).decode('utf-8')
        return None

@translator_bp.route('/translator')
def translator():
    return render_template('translator.html')

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in user_sessions:
        user_sessions[sid].stop()
        del user_sessions[sid]
    print(f"Client disconnected: {sid}")

@socketio.on('start_translation')
def handle_start_translation(data):
    sid = request.sid
    if sid in user_sessions:
        user_sessions[sid].stop()
    
    source_lang = data.get('source_lang', 'en-US')
    target_lang = data.get('target_lang', 'ja-JP')
    
    session = TranslationSession(source_lang, target_lang, sid, current_app._get_current_object())
    user_sessions[sid] = session
    session.start()

@socketio.on('stop_translation')
def handle_stop_translation():
    sid = request.sid
    if sid in user_sessions:
        user_sessions[sid].stop()
        del user_sessions[sid]
        print(f"[{sid}] Translation stopped by client.")

@socketio.on('audio_stream')
def handle_audio_stream(audio_chunk):
    sid = request.sid
    if sid in user_sessions:
        # The audio_chunk is expected to be a binary blob (bytes)
        user_sessions[sid].push_stream.write(audio_chunk)
