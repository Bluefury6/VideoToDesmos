const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width;
let height;
let threshhold = document.getElementById("threshhold").value;
let pointSampleRate = 2;
let distanceCutoff = 20;
let videoSource = "BadApple.mp4";
let video = document.createElement("video");
let videoFrames = [];
let frameNumber = 0;
let fps = 30;
let deltaT = 1 / fps;
let frameTotal;
let calculatorBlankState;
let startTime = 0;

// Desmos section

const elt = document.getElementById('calculator');
const calculator = Desmos.GraphingCalculator(elt, {lockViewport: true, expressions: false, settingsMenu: false});

const loadPoints = (points) => {
    for (let i = 0; i < points.length; i++) {
        //console.log("loading point set " + i + " of " + points.length);
        let compiledX = "";
        let compiledY = "";

        let sortedPoints = points[i];

        for (let k = 0; k < sortedPoints.length; k++) {
            compiledX += ", " + sortedPoints[k]["x"];
            compiledY += ", " + sortedPoints[k]["y"];
        }

        compiledX = compiledX.slice(2);
        compiledY = compiledY.slice(2);

        calculator.setExpression({id: "points" + i, latex: "([" + compiledX + "], [" + compiledY + "])", color: "rgb(0, 0, 0)", pointSize: "2", pointOpacity: "1", secret: true, fill: true, lines: false, lineWidth: 1, lineOpacity: true});
    }

    calculator.asyncScreenshot(getNewFrame);
}

// append \\operatorname{polygon} to the start to make a polygon
// Furina's color is (0, 0, 111)

const extractVideoFrames = () => {
    // console.log("beginning video extraction");
    frameTotal = video.duration / deltaT;

    ctx.drawImage(video, 0, 0, width, height);
    detectEdges(getPixelData());
    loadPoints(generatePoints(getPixelData()));
}

const convertImgToBlob = (img) => {
    const byteString = atob(img.split(",")[1]);
    const mimeString = img.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
}

const downloadScreenshot = (img, num) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(convertImgToBlob(img));
    link.download = `videoFrames\\frame_${num}`;
    link.click();
}

const getNewFrame = (screenshot) => {
    let img = new Image();
    img.src = screenshot;
    
    img.onload = () => {
        videoFrames.push(screenshot);
        downloadScreenshot(screenshot, frameNumber);

        //document.body.appendChild(img);
        calculator.setState(calculatorBlankState);

        ctx.drawImage(video, 0, 0, width, height);
        detectEdges(getPixelData());

        let endTime = performance.now();
        let avgTimePerFrame = endTime / frameNumber;
        let totalTime = avgTimePerFrame * frameTotal;
        let ttc = avgTimePerFrame * (frameTotal - frameNumber);

        let status = `

================================================================
    Frames processed: ${frameNumber}
    Frames remaining: ${Math.ceil(frameTotal - frameNumber)}
    Total frame count: ${Math.ceil(frameTotal)}
    Current evaluation time: 
        in minutes: ${endTime / 60000} min
        in hours: ${endTime / 3600000} hr
    Average processing time per frame: ${avgTimePerFrame / 1000} s
    Expected total time: 
        in minutes: ${totalTime / 60000} min
        in hours: ${totalTime / 3600000} hr
    Expected time to completion: ${ttc}
        in minutes: ${ttc / 60000} min
        in hours: ${ttc / 3600000} hr
================================================================

        `;
        console.log(status);

        if (frameNumber < frameTotal) {
            frameNumber++;
            video.currentTime = deltaT * frameNumber;
            loadPoints(generatePoints(getPixelData()));
        } else {
            let endTime = performance.now();
            console.log(`Processing complete. Time taken to evaluate ${frameTotal} frames: ${(endTime - startTime)/3600000} hours`);

            // compileFrames();
        }
    }
}

const compileFrames = () => {
    let recordedFrames = [];
    let numProcessedFrames = 0;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    document.body.appendChild(tempCanvas);

    let recorder = new MediaRecorder(tempCanvas.captureStream(), {
        mimeType: "video/webm",
    });

    recorder.ondataavailable = (e) => {
        recordedFrames.push(e.data);
        console.log("data recorded");
        // window.open(URL.createObjectURL(e.data));
    }

    recorder.onstop = () => {
        console.log(recordedFrames.slice(0, recordedFrames.length - 1));
        let blob = new Blob(recordedFrames.slice(0, recordedFrames.length - 1), { type: "video/webm" });
        console.log("final data:", blob);

        // window.open(URL.createObjectURL(blob));

        // downloadLink = document.createElement("a");
        // downloadLink.href = URL.createObjectURL(blob);
        // downloadLink.download = 'output-video.webm';
        // downloadLink.click();

        let finalVideo = document.createElement("video");
        finalVideo.src = URL.createObjectURL(blob);
        finalVideo.controls = true;
        // finalVideo.download = 'output-video.webm';
        // finalVideo.click();
        document.getElementById("videoContained").appendChild(finalVideo);
    }

    recorder.start();

    videoFrames.forEach((url) => {
        let frame = new Image();
        frame.src = url;

        frame.onload = () => {
            tempCanvas.width = frame.width;
            tempCanvas.height = frame.height;
            tempCtx.drawImage(frame, 0, 0, width, height);

            tempCanvas.toBlob((blob) => {
                recorder.ondataavailable({ data: blob });
                numProcessedFrames++;

                if (numProcessedFrames === videoFrames.length) {
                    recorder.stop();
                }
            }, "image/jpeg");
        }
    });
}

// End Desmos section

const getPixelData = () => {
    // console.log("reading image...");
    const totalData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let red = [];
    let green = [];
    let blue = [];

    for (let i = 0; i < totalData.length - 4; i += 4) {
        red.push(totalData[i]);
        green.push(totalData[i + 1]);
        blue.push(totalData[i + 2]);
    }

    // console.log("Image data obtained.");
    return {"red": red, "green": green, "blue": blue};
}

const detectEdges = async (data) => {
    for (let i = 1; i < data["red"].length - 1; i++) {
        let isEdge = false;

        let x = i % width;
        let y = Math.floor(i / width);

        let sides = (Math.abs(data["red"][i] - data["red"][i + 1]) > threshhold || Math.abs(data["red"][i] - data["red"][i - 1]) > threshhold) || (Math.abs(data["green"][i] - data["green"][i + 1]) > threshhold || Math.abs(data["green"][i] - data["green"][i - 1]) > threshhold) || (Math.abs(data["blue"][i] - data["blue"][i + 1]) > threshhold || Math.abs(data["blue"][i] - data["blue"][i - 1]) > threshhold);
        let verticals = (Math.abs(data["red"][i] - data["red"][i + width]) > threshhold || Math.abs(data["red"][i] - data["red"][i - width]) > threshhold) || (Math.abs(data["green"][i] - data["green"][i + width]) > threshhold || Math.abs(data["green"][i] - data["green"][i - width]) > threshhold) || (Math.abs(data["blue"][i] - data["blue"][i + width]) > threshhold || Math.abs(data["blue"][i] - data["blue"][i - width]) > threshhold)

        if (sides || verticals) {
            isEdge = true;
        }

        if (isEdge) {
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, 1, 1);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // console.log("complete");
}

const generatePoints = (data) => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    let points = [];

    for (let i = 0; i < data["red"].length; i += pointSampleRate) {
        let x = i % width;
        let y = Math.floor(i / width);

        if (data["red"][i] === 255) {
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, 2, 2);

            points.push({"x": x, "y": height - y});
        }
    }

    //console.log(points.length);

    let result = [];
    let sublist = [];
    //points = reorderPoints(points.slice(1));

    for (let i = 0; i < points.length; i++) {
        if (sublist.length < 9999) {
            sublist.push(points[i]);
        } else {
            result.push(sublist);
            sublist = [points[i]];
        }
    }

    if (sublist.length > 1) {
        result.push(sublist);
    }

    //console.log(result.flat().length);

    return result;
}

const init = () => {
    threshhold = document.getElementById("threshhold").value;

    video.src = "FurinaDemo.mp4";
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

        canvas.width = width;
        canvas.height = height;

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

// begin video replay section

let frameId = 0;
let n = 6722;
let time = 0;
let frameList = [];

const replayVideo = () => {
    if (frameId < n) {
        try {
            console.log(frameId);
            let nextFrameSource = "Bad_Apple/videoFrames_frame_" + frameId + ".png";
            let nextFrame = new Image();
            nextFrame.src = nextFrameSource;

            nextFrame.onerror = (error) => {
                console.log("Error loading frame:", error);
                frameId++;
                setTimeout(replayVideo, time);
            };

            nextFrame.onload = () => {
                frameList.push(nextFrame);
                ctx.drawImage(nextFrame, 0, 0, width, height);
                frameId++;
                setTimeout(replayVideo, time);
            }
        } catch {
            console.log("missing frame");
            frameId++;
            let timeout = setTimeout(replayVideo, time);
        }
    } else {
        frameId = 0;
    }
}

const ReplayVideo = () => {
    if (frameId < n) {
        try {
            console.log(frameId);
            let nextFrame = frameList[frameId];

            ctx.drawImage(nextFrame, 0, 0, width, height);
            frameId++;
            setTimeout(replayVideo, time);
        } catch {
            frameId++;
            setTimeout(replayVideo, time);
        }
    }
}

// end video replay section

init();