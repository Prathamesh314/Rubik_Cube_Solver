# Rubik_Cube_Solver

Just a fun project in Python.

## About

Rubik Solver is a Python Project aimed at teaching and helping people to solve the Rubik's Cube. You can provide any valid configuration to the code, and it will give you a text solution as well as allow you to visualize the solution.

This is the 1st version of the project and it requires further improvement. I aim to make learning the Rubik's Cube as easy as possible through my code. Currently, you can manually input your cube from all six sides, but I plan to implement cube scanning via camera instead of manual input.

## How to Setup

1. Clone the Repository to your local system.
2. `cd Rubik_Cube_Solver`
3. Create a virtual environment by running the command:
   `python -m venv rubik`

4. Activate the virtual environment:
   `source rubik/env/activate`

5. Install Dependencies:
   `pip install -r requirements.txt`

6. Enter the Configuration of your Rubik's Cube Manually.

- Rules to enter Rubik's Cube Configuration:
  - **Color's Definition:**
    - 1 -> Blue
    - 2 -> Yellow
    - 3 -> Green
    - 4 -> White
    - 5 -> Orange
    - 6 -> Red
  - **Face's Definition:**
    - You will find a 3D array named `scrambled_cube` in `cube.py`, it contains 6 2D arrays which represent the 6 faces of the Rubik's Cube. Here is how they are defined:
      - 1st array -> Back Face
      - 2nd array -> Top Face
      - 3rd array -> Front Face
      - 4th array -> Bottom Face
      - 5th array -> Left Face
      - 6th array -> Right Face
  - **Entering colors:**
    - After scrambling the real cube, choose which color you want to complete first.
    - For example, if you want to complete the Green color first, keep Green color at the bottom and fix positions of every face.
    - For example, one configuration could be: Bottom(Green), Front(Red), Top(Blue), Back(Orange), Left(Yellow), Right(White). Keep the same configuration till the last.
    - If Red is at the front, keep it at the front and same for all faces.
    - When you enter the colors for the Rubik's Cube in my program, enter colors in the right sequence as you see on your cube. Fill every face except the Back Face.
    - To fill the color of the Back Face, hold the Rubik's Cube in your fixed configuration and rotate the whole cube front two times, that means bring the whole back face to the front face, and now you can enter the back face's colors in my program.
- Save `cube.py` and run `main.py`.

7. After running `main.py`, you will see two solutions:

- One solution will contain standard notations like: `["F", "F'", "B", "B'", ...]`
- The other solution will contain a set of key bindings to move the 3D Cube made in Ursina engine.

8. To visualize the solution with the 3D Cube, just copy the 2nd type of solution and go to `rubik.py`. Find the variable named: `moves` and paste the 2nd solution in this variable.
9. Run `rubik.py`, now you can see a 3D Rubik's Cube. You can press the key bindings mentioned in the second solution or click on the "Next Move" button.

## Screenshots

1. Where to input Rubik's Cube configuration

![Input format in Rubik's Cube](/screenshots/rubikcube_input.jpeg)

2. How Solution looks like

![Solution Format](/screenshots/Solution_format.jpeg)

3. Where to input solution

Inside `rubik.py`

![Input solution moves](/screenshots/input_solution_moves.jpeg)

## 3D Cube

![Rubik's Cube](/screenshots/rubikcube.png)
