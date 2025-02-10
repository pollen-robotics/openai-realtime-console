# python_test.py
import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Create the log folder if it doesn't exist.
LOG_DIR = "session_logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Create a log file name based on the current date and time.
log_filename = datetime.now().strftime("%Y%m%d_%H%M%S.log")
log_filepath = os.path.join(LOG_DIR, log_filename)

# Configure logging: output to both a file and the console.
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_filepath),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins

# Valid emotion names (all lower-case, snake_case, without accents)
VALID_EMOTIONS = {
    "oui", "oui_triste", "oui_exite", "oui_fache", "non", "non_triste", "non_exite", "non_fache", "je_ne_sais_pas", "je_ne_sais_pas_triste", "je_ne_sais_pas_exite", "je_ne_sais_pas_fache",
    "accueillant", "affirmatif", "negatif", "incertain", "incomprehensif",
    "resigne", "reconnaissant", "amical", "enthousiaste", "attentif", "patient", "serviable",
    "celebrant", "rieur", "fier", "enjoue", "aimant",
    "enerve", "frustre", "impatient", "furieux", "mecontent",
    "abattu", "triste", "confus", "perdu", "solitaire",
    "etonne", "surpris", "curieux",
    "degoute",
    "timide"
}


def play_emotion(input_text, thought_process, emotion_name):
    # Validate that the emotion is in the allowed list.
    if emotion_name not in VALID_EMOTIONS:
        error_message = (f"Invalid emotion '{emotion_name}'. Allowed emotions are: " +
                         ", ".join(sorted(VALID_EMOTIONS)))
        logging.error(error_message)
        return f"Error: {error_message}"
    
    # Log the parameters
    logging.info("Executing play_emotion:")
    logging.info("Input text: %s", input_text)
    logging.info("Thought process: %s", thought_process)
    logging.info("Emotion: %s", emotion_name)
    
    # Here you would add the code to command your robot.
    # For now, we simply return "ok".
    return "ok"

@app.route("/play_emotion", methods=["POST"])
def handle_play_emotion():
    data = request.get_json()
    if not data:
        logging.error("No JSON data received.")
        return jsonify({"status": "error", "result": "No JSON data received"}), 400

    input_text = data.get("input_text", "")
    thought_process = data.get("thought_process", "")
    emotion_name = data.get("emotion_name", "")
    
    logging.debug("Received /play_emotion request with data: %s", data)
    
    result = play_emotion(input_text, thought_process, emotion_name)
    return jsonify({"status": "success", "result": result})

if __name__ == "__main__":
    logging.info("Starting Flask server on port 5001...")
    app.run(port=5001)
