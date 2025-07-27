#!/usr/bin/env python3
"""Minimal Flask test to diagnose connection issues"""

from flask import Flask
import threading
import time

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>Test Server Working!</h1><p>If you see this, the connection is working.</p>'

@app.route('/test')
def test():
    return {'status': 'success', 'message': 'API endpoint working'}

def run_server():
    print("🔧 Starting minimal test server...")
    try:
        app.run(host='0.0.0.0', port=8888, debug=False, use_reloader=False)
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    print("🧪 Minimal Flask Connection Test")
    print("=" * 40)
    
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Give server time to start
    time.sleep(2)
    
    print("✅ Server should be running on:")
    print("   - http://localhost:8888")
    print("   - http://127.0.0.1:8888")
    print("   - http://0.0.0.0:8888")
    print("\n🔍 Testing connection...")
    
    # Test connection
    import subprocess
    try:
        result = subprocess.run(['curl', '-s', 'http://localhost:8888'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Connection test successful!")
            print(f"Response: {result.stdout[:50]}...")
        else:
            print(f"❌ Connection failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Test error: {e}")
    
    # Keep server running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")