# VideoToDesmos
My system for converting videos to Desmos animations. 
Currently under construction. Very hands-on usability currently.

Here is an example of a final product: [https://www.youtube.com/watch?v=PrwHFElKx7U](https://youtu.be/SXUkZxaTs0g) 

This program can be used by performing the following steps:



CURRENT VERSION (Python implementation):

Setup:
1. Clone repo. (Obviously)
2. Change the "video_source" variables in both the python server and javascript frontend.
3. (Optional) Change frame rate and frame increment values in the python server.

Running the program
1. Run the python server via terminal.
2. Open the javascript file in the browser. (Directly via the path)
3. Click the "run" button once everything has loaded.
4. Wait several hours. (Depends on length, complexity of video)
5. Once rendering is complete, some errors should appear. Ignore them. Ensure the server is on, but not running. You can run `finishRecording()` if you want it to stop early.
6. Make a copy of the "converted_video.mp4" file. The copy will be the final video.

If the video is corrupted, you likely either didn't run `finishRecording()` (if it was needed), or killed the server.
Audio is currently not included in the video, and you may need to add it back via a video editor.

I am planning to add more user friendliness in the future.
