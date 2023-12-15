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
deltaFrame = 1
video = "test_videos\\FurinaDemo.mp4"
capture = cv2.VideoCapture(video)

fps = capture.get(cv2.CAP_PROP_FPS)
frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
print("total frame count:", frame_count)

width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

output_path = 'test_videos\\converted_video.mp4'
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
output_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

app = Flask(__name__)
CORS(app)



@app.route('/initialize', methods=['POST'])
def initialize():
    print("\n\n")
    global frame_number

    capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number - 1)
    frame_number += deltaFrame

    ret, frame = capture.read()

    if not ret:
        print("Error loading frame")
        frame_number -= deltaFrame
        return jsonify({"image": "video complete"})#jsonify({"image": {'x': [[]], 'y': [[]]}})

    print("loading frame", frame_number)

    grayscale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    edged_frame = cv2.Canny(grayscale, 40, 45)
    frame = cv2.cvtColor(edged_frame, cv2.COLOR_GRAY2BGR)

    return jsonify({"image": compileToPoints(frame)})



def compileToPoints(frame):
    frame = np.array(frame)
    print("analyzing", len(frame)*len(frame[0]), "pixels")
    edge_pixels = np.argwhere(frame[:, :, 0] == 255)
    print(len(edge_pixels), "edge pixels detected")

    pointSet = {
        'x': [edge_pixels[:, 1].tolist()[i:i + 9999] for i in range(0, len(edge_pixels[:, 1].tolist()), 9999)], 
        'y': [(len(frame) - edge_pixels[:, 0]).tolist()[i:i + 9999] for i in range(0, len((len(frame) - edge_pixels[:, 0]).tolist()), 9999)]
    }

    # pointSet = {'x': [], 'y': []}
    # pointsX = []
    # pointsY = []
    
    # for y in range(len(frame)):
    #     for x in range(len(frame[y])):
    #         if frame[y][x][0] == 255:
    #             pointsX.append(x)
    #             pointsY.append(len(frame) - y)

    #         if len(pointsX) == 9999:
    #             pointSet['x'].append(str(pointsX))
    #             pointSet['y'].append(str(pointsY))
    #             pointsX = []
    #             pointsY = []

    # pointSet['x'].append(str(pointsX))
    # pointSet['y'].append(str(pointsY))

    print("pixels ready for graphing")
    return pointSet



def loadImageForFrontend(frame):
    pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format='PNG')
    img_bytes = img_bytes.getvalue()

    b64_img = base64.b64encode(img_bytes).decode('utf-8')

    return b64_img



@app.route('/end_recording', methods=['POST'])
def end_recording():
    output_video.release()

    return Flask.send_file(output_path, as_attachment=True)



@app.route('/process_new_frame', methods=['POST'])
def process_payload():
    data = request.get_json()
    url = data['image']
    global frame_number

    _, image_data = url.split(';base64,')
    img_binary = base64.b64decode(image_data)
    nparr = np.frombuffer(img_binary, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    output_video.write(img_np)
    print("frame", frame_number, "compiled to video")

    return jsonify(frame_number)

if __name__ == '__main__':
    app.run(debug=True)