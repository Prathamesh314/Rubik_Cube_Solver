#print("Hello World")

from helper import CubeHelper

class Cube:
    def __init__(self, number):
        self.cube = []
        self.colors = {
            1: "White",
            2: "Blue",
            3: "Yellow",
            4: "Green",
            5: "Orange",
            6: "Red"
        }
        self.dirs = {
            "Face": 0,
            "Top": 1,
            "Back": 2,
            "Bottom": 3,
            "Right": 4,
            "Left": 5
        }
        self.scrambled_cube = []
        self.build_cube(number)
        self.build_scramble_cube()
        self.cube_helper = CubeHelper(self.dirs)
    
    def build_cube(self, number):
        # order will be Face, Top, Back, Bottom, Right, Left
        # This cube is of type 1 where blue is at top and white is at front and orange is at right
        self.cube = [
            [[1, 1, 1],
             [1, 1, 1],
             [1, 1, 1]
            ],
            [[2, 2, 2],
             [2, 2, 2],
             [2, 2, 2]
            ],
            [[3, 3, 3],
             [3, 3, 3],
             [3, 3, 3]
            ],
            [[4, 4, 4],
             [4, 4, 4],
             [4, 4, 4]
            ],
            [[5, 5, 5],
             [5, 5, 5],
             [5, 5, 5]
            ],
             [[6, 6, 6],
             [6, 6, 6],
             [6, 6, 6]
            ],
        ]
    
    def build_scramble_cube(self):
       self.scrambled_cube = [
            [
             [2, 2, 5],
             [5, 1, 4],
             [6, 4, 2]
            ],
            [
             [1, 3, 3],
             [1, 2, 6],
             [1, 5, 6]
            ],
            [
             [6, 3, 3],
             [3, 3, 2],
             [3, 5, 4]
            ],
            [
             [5, 2, 3],
             [6, 4, 2],
             [5, 6, 1]
            ],
            [
             [2, 4, 5],
             [3, 5, 1],
             [6, 1, 4]
            ],
            [
             [5, 2, 3],
             [6, 4, 2],
             [5, 6, 1]
            ],
           
        ] 

    def show_cube(self):
        for faces in self.cube:
            print(self.colors[faces[0][0]])
            for cubes in faces:
                print(cubes)
            print()
    
    def show_scramble_cube(self):
        for faces in self.scrambled_cube:
            for cubes in faces:
                print(cubes)
            print()

    def rotate_X(self, direction, row):
        self.cube_helper.rotate_X(self.scrambled_cube, direction, row)
    
    def rotate_Y(self, direction, row):
        self.cube_helper.rotate_Y(self.scrambled_cube, direction, row)
    
    def rotate_Z(self, direction, row):
        self.cube_helper.rotate_Z(self.scrambled_cube, direction, row)

    

cube = Cube(2)
print("Original Scrambled Cube")
cube.show_scramble_cube()
cube.rotate_Z(-1, 2)
print("After rotating Front Face to Right side")
cube.show_scramble_cube()

