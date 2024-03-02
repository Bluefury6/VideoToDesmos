const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt, {lockViewport: true, expressions: false, settingsMenu: false});
const videoSource = "..\\test_videos\\Celeste 2022-07-20 16-51-19_Trim.mp4";
graphColor = "rgb(0, 0, 111)";
// colors used in my example videos:
// furina: (0, 0, 111), charlotte: (209, 29, 83), navia: (179, 119, 0), raiden: (128, 0, 128)

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let image = new Image();

const init = () => {
    let video = document.createElement("video");
    video.src = videoSource;
    video.type = "video/mp4";
    video.controls = true;
    video.id = "video";
    document.getElementById("videoContainer").appendChild(video);

    // code I stole to load the video fully
    var req = new XMLHttpRequest();
    req.open('GET', videoSource, true);
    req.responseType = 'blob';

    req.onload = function() {
        // Onload is triggered even on 404
        // so we need to check the status code
        if (this.status === 200) {
            var videoBlob = this.response;
            var vid = URL.createObjectURL(videoBlob); // IE10+
            // Video is now downloaded
            // and we can set it as source on the video element
            video.src = vid;
        }
    }
    req.onerror = function() {
    // Error
    }

    req.send();
    // end stolen code section (credit to https://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/)

    video.addEventListener("loadeddata", () => {
        let videoInfo = document.getElementById("video").getBoundingClientRect();

        width = videoInfo["width"];
        height = videoInfo["height"];

        elt.style.width = width + "px";
        elt.style.height = height + "px";

        calculator.resize();

        calculator.setMathBounds({
            left: -width*0.1,
            right: width*1.1,
            bottom: -height*0.1,
            top: height*1.1
        });

        calculatorBlankState = calculator.getState();
    });
}

const run = () => {
    fetch('http://localhost:5000/initialize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data["image"] === "video complete") {
            finishRecording();
            return null;
        } else if (data["image"] === "error") {
            run();
        } else {
            document.getElementById("updateInfo").innerText = data["updateInfo"];
            loadFrame(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        run();
    });
}

const loadFrame = (frame) => {
    calculator.setState(calculatorBlankState);
    calculator.clearHistory();
    for (let j = 0; j < frame['image']['x'].length; j++) {
        calculator.setExpression({id: "points" + j, latex: "([" + frame['image']['x'][j] + "], [" + frame['image']['y'][j] + "])", color: graphColor, pointSize: "2", pointOpacity: "1", secret: true, lines: false, lineWidth: 1, lineOpacity: 1});
    }
    calculator.asyncScreenshot(returnFrame);
}

const returnFrame = (frame) => {
    image.src = frame;
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        fetch('http://localhost:5000/process_new_frame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({image: canvas.toDataURL('image/jpeg')})
        })
        .then(response => response.json())
        .then(data => {
            run();
        })
        .catch(error => {
            console.error('Error:', error);
            returnFrame(frame);
        });
    }
}

const finishRecording = () => {
    fetch('http://localhost:5000/end_recording', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify('')
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

init();