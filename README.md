# VideoToDesmos
My system for converting videos to Desmos animations. 
Currently very hands-on usability.

There are several example videos up on my YouTube channel here: [https://www.youtube.com/channel/UCdeWXcvguA3tBtnXbDQsoRw]
This version should be considered the lower quality but faster version of my more recent rewrite, with full color rendering: [https://github.com/Bluefury6/DesmosPolygonalImages]

This program can be used by performing the following steps:



Setup:
1. Clone repo. (Obviously)
2. Install dependencies on your python path (flask, clask_cors, cv2, numpy, PIL).
3. Place an mp4 file in the test_videos folder.
4. Replace the <example>.mp4 with the actual name of your file. (located on line 14 of the python backend, and line 3 in the ks frontend)
5. (Optional) Change frame rate and frame increment values in the python server.
6. (Optional) Change graphColor value in the javascript frontend.

Running the program
1. Run the python server via terminal.
2. Open the javascript file in the browser. (Directly via the path)
3. Click the "run" button once everything has loaded.
4. Wait several hours. (Depends on length, complexity of video)
5. Once rendering is complete, things should finish loading. Ensure the server is on, but not running. You can run `finishRecording()` in the javascript console if you want it to stop early.
6. Make a copy of the "converted_video.mp4" file. The copy will be the final video.

If the video is corrupted, you likely either didn't run `finishRecording()` (if it was needed), or killed the server.
Audio is currently not included in the video, and you may need to add it back via a video editor.

I am planning to add more user friendliness in the future. Maybe.
