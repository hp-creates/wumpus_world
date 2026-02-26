This repo contains the code for a simple and fun game called "Wumpus World". The game is usually taught in introductory artificial intelligence courses to illustrate concepts of knowledge representation, reasoning, and decision-making under uncertainty. That's where i heard about it for the first time from my Profesor.

First i wrote a C++ version of the game that can be easily played in terminal. Then i decided to make a web version of the game using JavaScript, HTML, and CSS. The web version provides a more interactive and visually appealing experience for players.

[To Play Click Here](https://hp-creates.github.io/wumpus_world/)

Rules:
- The player starts in a safe room and must navigate through a grid-based world to find and kill the wumpus, while avoiding pits and collecting gold.
- Gold points in start are 3 times the grid size and +4 gold if you find gold in the world.
- Each move costs 1 gold point, and shooting an arrow costs 2 gold points.
- The player can move in four directions (up, down, left, right) and toggle to shoot mode to shoot an arrow (first select the direction and then shoot)to kill the wumpus.
- The game provides sensory information of all four-cells (up-left-fown-right) around all the subjects in game, to the player, such as breeze for a Pit , glitter for the Gold and stench for the Wumpus.
- The player wins by killing the wumpus and collecting the gold, and loses if they fall into a pit or are killed by the wumpus or the gold ends.
  
Steps:
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Compile the C++ code using a C++ compiler (e.g., g++).
Windows users can use the following command in Command Prompt or PowerShell:
```bash 
g++ wumpus_world.cpp
./a.exe
```
Mac and Linux users can use the following command in Terminal:
```bash
g++ wumpus_world.cpp -o wumpus_world
./wumpus_world
```

To run the web version of the game:
1. Open the `index.html` file in a web browser (e.g., Chrome, Firefox, Safari).
2. Follow the on-screen instructions to play the game.



Thank you for checking out the game, I hope it'll make you have fun and learn some AI concepts along the way. 


