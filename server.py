"""
前端静态服务器 + API代理
用于 Render 部署
"""
from flask import Flask, send_from_directory, request, jsonify
import os
import urllib.request
import urllib.error

app = Flask(__name__, static_folder='.')

# 后端API地址
API_BASE = 'https://newstimeline-api.onrender.com'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# API代理 - 将前端请求转发到后端
@app.route('/api/news')
def proxy_news():
    try:
        params = request.query_string.decode('utf-8')
        url = f"{API_BASE}/api/news"
        if params:
            url += f"?{params}"
        
        with urllib.request.urlopen(url, timeout=30) as response:
            data = response.read().decode('utf-8')
            return data, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/categories')
def proxy_categories():
    try:
        url = f"{API_BASE}/api/categories"
        with urllib.request.urlopen(url, timeout=30) as response:
            data = response.read().decode('utf-8')
            return data, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health')
def proxy_health():
    try:
        url = f"{API_BASE}/api/health"
        with urllib.request.urlopen(url, timeout=10) as response:
            data = response.read().decode('utf-8')
            return data, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
