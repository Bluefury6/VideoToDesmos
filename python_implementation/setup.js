const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt, {lockViewport: true, expressions: false, settingsMenu: false});
let i = 0;
const videoSource = "..\\test_videos\\Neuvillette_Demo.mp4";

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
        //console.log(videoInfo);

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
        // console.log('Response:', data);
        loadFrame(data);
        //run();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const loadFrame = (frame) => {
    i++;
    calculator.setExpression({id: "points" + i, latex: `[${frame['image']}]`, color: "rgb(0, 50, 150)", pointSize: "2", pointOpacity: "1", secret: true, lines: false, lineWidth: 1, lineOpacity: true});
    calculator.asyncScreenshot(returnFrame);
}

const returnFrame = (frame) => {
    fetch('http://localhost:5000/process_new_frame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(frame)
    })
    .then(response => response.json())
    .then(data => {
        // console.log('Response:', data);
        loadFrame(data);
        //run();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

const closeWindows = () => {
    fetch('http://localhost:5000/delete_windows', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify('')
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        // You can handle the response data here
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

init();