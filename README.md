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
4. wait several hours (depends on length, complexity of video)
5. once rendering is complete, some errors should appear. ignore them. ensure the server is on, but not running. you can run `finishRecording()` if you want it to stop early
6. make a copy of the "converted_video.mp4" file. the copy will be the final video.

if the video is corrupted, you likely either didn't run `finishRecording()` (if it was needed), or killed the server.
audio is currently not included in the video, and you may need to add it back via a video editor.

i am planning to add more user friendliness in the future.
