# Rubik_Cube_Solver

Just a fun project in python

# About

Rubik Solver is a Python Project aims to teach and help people to solve Rubik Cube.
You can give any Valid Configuration to the code and it will give you a TEXT solution as well as you can visualize the solution

This is the 1st version of the Project and it requires more improvement. I want to make as easy as possible way to learn a Rubik Cube through my code.
Currently you can manually input your cube from all six sides, I plan to do this thing just by scanning your cube via Camera instead of doing manually.

Let's talk about code now.

# How to Setup

1. Clone the Repository in your local system.
2. cd Rubik_Cube_Solver
3. Create a virtual environment by running command
   > python -m venv rubik
4. Activate virtaul environment
   source rubik/env/activate
5. Install Dependencies
   run pip install -r requirements.txt

6. Enter Configuration of your Rubik Manually.
   Rules to enter rubik cube Configuration :-
   6a. Color's Definition
   a. 1 -> Blue
   b. 2 -> Yellow
   c. 3 -> Green
   d. 4 -> White
   e. 5 -> Orange
   f. 6 -> Red

   6b. Face's Definition
   You will find a 3d array names scrambled_cube in cube.py, It contains 6 2d array which represents 6 faces of rubik cube. Here is how they are defined :-
   a. 1st array -> Back Face
   b. 2nd array -> Top Face
   c. 3rd array -> Front Face
   d. 4th array -> Bottom Face
   e. 5th array -> Left Face
   f. 6th array -> Right Face

   6c. Entering colors :-
   a. After You Scrambled Real Cube, Choose which color you want to Complete First.
   b. Suppose you want to complete Green color first then keep Green color at Bottom and Fix positions of every Face.
   c. For ex, one of the configuration can be :- Bottom(Green), Front(Red), Top(Blue), Back(Orange), Left(Yellow), Right(White). So keep same configuration till last.
   d. If Red is at front, keep it at front and same for all faces.
   e. Now when you enter the colors for Rubik Cube in my program, so enter colors in right sequence as you see on your cube. Fill every face except Back Face.
   f. To Fill color of Back Face, hold rubik cube in your fixed configuration and rotate whole cube front two times, that means bring whole back face to front face and now you can enter back face's colors in my program.
   g. Save cube.py and run main.py.

7. After Running main.py, you will see two solutions, one solution will contains standard notations like :- ["F", "F'", "B", "B'","...."] and other solution will contains set of keybindings to move 3d Cube made in ursina engine.
8. To Visualize Solution with 3d Cube, just copy 2nd type of solution and go in rubik.py. Find variable named :- "moves" and paste that 2nd solution in this variable.
9. Run rubik.py , now you can see a 3d rubik cube, you can press the keybindings mentioned in second solution of you can click on button "Next Move".

# Here are screenshots

1. Where to input rubik cube configuration

Inside cube.py
<img src="/screenshots/rubikcube_input.jpeg" alt="Input format in rubik cube"/>

2. How Solution looks like
   <img src="/screenshots/Solution_format.jpeg" alt="Solution_format"/>

3. Where to input solution
   Inside rubik.py
   <img src="/screenshots/input_solution_moves.jpeg" alt="Input_solution_moves" />

# 3D Cube

<img src"/screenshots/rubikcube.png" alt="rubikcube"/>
