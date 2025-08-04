import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "/home/ubuntu/upload" # Assuming your files are in this directory

os.chdir(DIRECTORY)

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving at port {PORT}")
    print(f"Serving files from: {DIRECTORY}")
    httpd.serve_forever()

