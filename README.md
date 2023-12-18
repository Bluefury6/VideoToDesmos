# VideoToDesmos
My system for converting videos to Desmos animations. 
Currently under construction. Very hands-on usability currently.

Here is an example of a final product: [https://www.youtube.com/watch?v=PrwHFElKx7U](https://youtu.be/SXUkZxaTs0g) 

This program can be used by performing the following steps:



CURRENT VERSION (Python implementation):

Setup:
1. clone repo
2. change the "video_source" variables in both the python server and javascript frontend
3. (optional) change frame rate and frame increment values in the python server

Running the program
1. run the python server via terminal
2. open the javascript file in the browser (directly via the path)
3. click the "run" button once everything has loaded
4. wait ~10 hours (depends on length, complexity of video)
5. once rendering is complete, some errors should appear. ignore them. ensure the server is on, but not running. run `finishRecording()` if you want it to stop early
6. make a copy of the "converted_video.mp4" file. the copy will be the final video.

if the video is corrupted, you likely either didn't run `finishRecording()` (if it was needed), or killed the server.
audio is currently not included in the video, and you may need to add it back via a video editor.



DEPRECATED (JS only version):

Setup:
1. clone the repo onto your computer
2. copy your original video into the same folder as this repo.
3. create a new folder for all video frames.
4. set your browser's download directory to this new folder.
5. adjust fps variable in the code if necessary.
7. open display.html in a new tab.

Running the program: 
1. set the threshold for the edge detection using the box in the top left. may need tuning from the default value.
2. click run. your video should begin rendering and will appear frame by frame in three places on the screen.
3. wait. this could take several hours. statistics will be shown in the console.
4. once rendering is complete, you should have numerous images in the folder you made. set the variable n in the code to the number of images in this folder.
5. reload the display.html page, then click replay.
6. wait for it to finish loading. then start screen recording.
7. run the following code in the terminal, then close the terminal:
     `setTimeout(ReplayVideo, 10000);`
8. watch the video play, then end your screen recording once it is done.
9. use a video editor of your choice to modify the screen recording to your liking. may need to be slightly sped up/slown down.
