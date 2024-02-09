#print("Hello World")

from helper import CubeHelper

class Cube:
    def __init__(self, number):
        self.cube = []
        self.colors = {
            "White":1,
            "Red": 2,
            "Yellow": 3,
            "Orange": 4,
            "Green": 5,
            "Blue": 6,
        }
        self.dirs = {
            "Back": 0,
            "Top": 1,
            "Face": 2,
            "Bottom": 3,
            "Left": 4,
            "Right": 5
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
             [4, 1, 6],
             [3, 4, 1],
             [3, 2, 2]
            ],
            [
             [5, 3, 3],
             [6, 1, 6],
             [1, 1, 3]
            ],
            [
             [2, 4, 4],
             [4, 2, 6],
             [4, 2, 4]
            ],
            [
             [5, 6, 1],
             [4, 3, 2],
             [5, 5, 2]
            ],
            [
             [2, 3, 5],
             [5, 5, 5],
             [1, 3, 3]
            ],
            [
             [6, 4, 6],
             [1, 6, 2],
             [6, 5, 1]
            ],
           
        ] 

    def show_cube(self):
        color_indices = {}
        for i,j in self.colors.items():
            color_indices[j] = i;
        for i in range(len(self.scrambled_cube)):
            for j in range(len(self.scrambled_cube[0])):
                for k in range(len(self.scrambled_cube[0][0])):
                  print(color_indices[self.scrambled_cube[i][j][k]], end=" ")
                print()
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

    def is_solved(self):
        size = len(self.scrambled_cube)
        n = len(self.scrambled_cube[0])
        m = len(self.scrambled_cube[0][0])
        for i in range(size):
            for j in range(n):
                for k in range(m):
                    if self.scrambled_cube[i][j][k] != self.cube[i][j][k]:
                        return False
        return True
    
    def collect_pieces(self, color, level):
        size = len(self.scrambled_cube)
        n = len(self.scrambled_cube[0])
        m = len(self.scrambled_cube[0][0])
        desired_piece_locs = set()
        index_of_color = self.colors[color]
        print(index_of_color)
        for i in range(size):
            for j in range(n):
                for k in range(m):
                    if self.scrambled_cube[i][j][k] == index_of_color and j != k:
                        if j==0 and k==0 or j==0 and k==n-1 or j == n-1 and k==0 or j== n-1 and k==m-1:
                            continue
                        if k == 0 and j == 0 or k == 0 and j == n-1 or k == m-1 and j == 0 or k == m-1 and j == n-1:
                            continue
                        #print(self.scrambled_cube[i][j][k])
                        desired_piece_locs.add((i,j,k))
        return list(desired_piece_locs)

cube = Cube(2)
#cube.show_initial_pos()
#cube.show_scramble_cube()
cube.show_cube()
print(cube.collect_pieces("Red", 1))
