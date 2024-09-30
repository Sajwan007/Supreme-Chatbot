from flask import Flask, request, jsonify, render_template
from g4f.client import Client

app = Flask(__name__)
client = Client()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=["GET", "POST"])
def chat():
    user_input = request.json.get('message')
    model = request.json.get('model', 'gpt-4o')
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": user_input}],
        language = 'english',
    )
    return jsonify({'response': response.choices[0].message.content})

if __name__ == '__main__':
    app.run(debug=True)
