#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8083
Handler = http.server.SimpleHTTPRequestHandler

os.chdir('/Users/ykshim/Desktop/claude_example/gene_seq')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Open your browser to: http://localhost:{PORT}")
    httpd.serve_forever()