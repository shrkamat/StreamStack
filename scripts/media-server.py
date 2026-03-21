#!/usr/bin/env python3

from http.server import HTTPServer, SimpleHTTPRequestHandler
from functools import partial
import sys


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        # Disabling caching is not required, only for testing purposes.
        # For production & better performance it should be disabled.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


directory = sys.argv[1] if len(sys.argv) > 1 else "."
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
print(f"Serving {directory} on {port}")

HTTPServer(
    ("0.0.0.0", port),
    partial(Handler, directory=directory)
).serve_forever()
