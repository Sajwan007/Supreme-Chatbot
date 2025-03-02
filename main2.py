from flask import Flask, request, jsonify, render_template
from g4f.client import Client
from g4f import Provider
import requests

app = Flask(__name__)

# Configure client with browser-like headers
client = Client(
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://www.google.com/",
    },
    provider=Provider.Bing  # Try different providers
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message'}), 400

        response = client.chat.completions.create(
            model=data.get('model', 'gpt-4'),
            messages=[{"role": "user", "content": data['message']}],
            cookies={},  # Add cookies if required
            proxy=requests.get('https://api.proxyscrape.com/v2/?request=displayproxies').text.split('\n')[0],  # Add proxy
            timeout=30
        )
        
        return jsonify({'response': response.choices[0].message.content})
    
    except Exception as e:
        return jsonify({'error': f'API Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)