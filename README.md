# VideoToDesmos
My completely from scratch system for converting videos to Desmos animations. 
Currently under construction. Very hands-on usability currently.

Here is an example of a final product: https://www.youtube.com/watch?v=PrwHFElKx7U 

This program can be used by performing the following steps:

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
