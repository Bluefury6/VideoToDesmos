from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
import base64

video = None
capture = None
frames = []

frame_number = 1
video = "test_videos\\Neuvillette_Demo.mp4"
capture = cv2.VideoCapture(video)

fps = capture.get(cv2.CAP_PROP_FPS)
frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

output_path = 'result\\neuvillette.mp4'
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
output_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

app = Flask(__name__)
CORS(app)



@app.route('/initialize', methods=['POST'])
def initialize():
    global frame_number

    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number - 1)
    frame_number += 1

    ret, frame = capture.read()

    if not ret:
        print("Error loading frame")
        # break

    grayscale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    edged_frame = cv2.Canny(grayscale, 50, 50)
    frame = cv2.cvtColor(edged_frame, cv2.COLOR_GRAY2BGR)

    return jsonify({"image": compileToPoints(frame)})



def compileToPoints(frame):
    points = []
    print(len(frame)*len(frame[0]))

    for y in range(len(frame)):
        for x in range(len(frame[y])):
            if frame[y][x][0] == 255:
                points.append(f"({x}, {len(frame) - y})")

            if len(points) == 9999:
                break

    print(len(points))
    return ", ".join(points)



def loadImageForFrontend(frame):
    pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format='PNG')
    img_bytes = img_bytes.getvalue()

    b64_img = base64.b64encode(img_bytes).decode('utf-8')

    return b64_img



@app.route('/delete_windows', methods=['POST'])
def close_windows():
    cv2.destroyAllWindows()

    return jsonify("windows destroyed")



@app.route('/process_new_frame', methods=['POST'])
def process_payload():
    data = request.get_json()

    

    return jsonify("frame loaded")

if __name__ == '__main__':
    app.run(debug=True)