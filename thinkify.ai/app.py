from flask import Flask, render_template, request, jsonify
import json
import requests

app = Flask(__name__)

# ===== CONFIG =====
API_KEY = "AIzaSyAsSw3g46vN5GEj7qB0W_JvZ2RmHwpz44k"  # Your API key
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"

SYSTEM_PROMPT = """You are ThinkAi, an academic aiwha.
You always:
- Identify the topic from the user's first question.
- Ask only questions that are directly related to that topic.
- Build each new question based on the user's previous answers.
- Keep your questions simple, one idea at a time .
- Never give the final answer until you have asked 5–6 questions.

After the 5th or 6th question:
- Summarize what the user has said.
- Give a complete, final answer in a clear, well-written format, as if they had asked you directly in the first place.
- Use the user’s own reasoning wherever possible and fill gaps naturally.
"""

conversation_history = []
question_count = 0
topic_locked = False

# ===== GEMINI API CALL =====
def get_bot_response(user_prompt, conversation_history):
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": conversation_history + [
            {"role": "user", "parts": [{"text": user_prompt}]}
        ]
    }
    headers = {"Content-Type": "application/json"}
    full_api_url = f"{API_URL}?key={API_KEY}"

    try:
        response = requests.post(full_api_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        result = response.json()
        return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"

# ===== ROUTES =====
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chat():
    global question_count, topic_locked, conversation_history

    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"response": "Please type something."})

    conversation_history.append({"role": "user", "parts": [{"text": user_message}]})

    if not topic_locked:
        topic_locked = True

    question_count += 1

    if question_count > 6:
        bot_message = get_bot_response("Now provide the final answer based on our conversation. and dotn use greetings like kia ora use hello instead", conversation_history)
        return jsonify({"response": bot_message, "final": True})

    bot_message = get_bot_response(user_message, conversation_history)
    conversation_history.append({"role": "model", "parts": [{"text": bot_message}]})

    return jsonify({"response": bot_message, "final": False})
@app.route("/history", methods=["GET"])
def get_history():
    return jsonify({"history": conversation_history})   
@app.route("/reset", methods=["POST"])
def reset_chat():
    global conversation_history, question_count, topic_locked
    conversation_history = []
    question_count = 0
    topic_locked = False
    return jsonify({"message": "Chat reset successfully."})

if __name__ == "__main__":
    app.run(debug=True)



