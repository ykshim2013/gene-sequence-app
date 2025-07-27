#!/usr/bin/env python3
print("Starting Flask server...")

try:
    from app import app
    print("Flask app imported successfully")
    
    print("Starting server on http://localhost:9000")
    app.run(host='localhost', port=9000, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"Error starting server: {e}")
    import traceback
    traceback.print_exc()