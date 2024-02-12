#print("Hello WHere's the code with corrected indentation:

from helper import CubeHelper

class Cube:
    def __init__(self, number):
        self.cube = []
        self.colors = {
            "White": 1,
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

        self.opposite_color = {
            "White": "Yellow",
            "Yellow": "White",
            "Red": "Orange",
            "Orange": "Red",
            "Green": "Blue",
            "Blue": "Green",
        }
        self.orders = ["Back", "Top", "Front", "Bottom", "Left", "Right"]
        self.scrambled_cube = []
        self.build_cube(number)
        self.build_scramble_cube()
        self.cube_helper = CubeHelper(self.dirs)
        self.n = 3;

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
            # Back
            [
                [4, 1, 6],
                [3, 4, 1],
                [3, 2, 2]
            ],
            # Top
            [
                [5, 3, 3],
                [6, 1, 6],
                [1, 1, 3]
            ],
            # Front
            [
                [2, 4, 4],
                [4, 2, 6],
                [4, 2, 4]
            ],
            # Bottom
            [
                [5, 6, 1],
                [4, 3, 2],
                [5, 5, 2]
            ],
            # Left
            [
                [2, 3, 5],
                [5, 5, 5],
                [1, 3, 3]
            ],
            # Right
            [
                [6, 4, 6],
                [1, 6, 2],
                [6, 5, 1]
            ],

        ]

    def show_cube(self):
        color_indices = {}
        for i, j in self.colors.items():
            color_indices[j] = i;
        for i in range(len(self.scrambled_cube)):
            print(f"Face: {self.orders[i]}")
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
        color = self.colors[color]
        #print(color)
        for i in range(size):
            if i == 1:
                continue
            for j in range(n):
                for k in range(m):
                    if self.scrambled_cube[i][j][k] == color and j != k:
                        if j == 0 and k == 0 or j == 0 and k == n - 1 or j == n - 1 and k == 0 or j == n - 1 and k == m - 1:
                            continue
                        if k == 0 and j == 0 or k == 0 and j == n - 1 or k == m - 1 and j == 0 or k == m - 1 and j == n - 1:
                            continue
                        #desired_piece_locs.add((i, j, k))
                        return [(i,j,k)]
        return []

    def get_opposite_color(self, color):
        return self.opposite_color[color]

    def find_color(self, color):
        for _ in range(len(self.scrambled_cube)):
            if self.scrambled_cube[_][1][1] == self.colors[color]:
                return _;
        return -1

    def is_occupied(self, index_of_opp_color, color, r, c):
        return self.scrambled_cube[index_of_opp_color][r][c] == color

    def make_this_place_empty(self, index_of_opp_color, color, row, col):
        while self.is_occupied(index_of_opp_color, color, row, col):
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)

    def move_center_pieces(self, pos_of_edge_piece,color, level):
        pieces = pos_of_edge_piece
        opp_color = self.get_opposite_color(color)
        index_of_opp_color = self.find_color(opp_color)
        color = self.colors[color]
        # print(opp_color)
        # print(self.find_index_of_opposite_color(opp_color))
        for _ in pieces:
            dim, r, c = _;
            if dim == self.dirs["Bottom"]:
                nrow = self.n - 1 - r
                if not self.is_occupied(index_of_opp_color, color, nrow, c):
                    if r == 0 or r == self.n - 1:
                        print(f"Move {dim}, {r}, {c} around Z direction 2 times")
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, r)
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, r)
                    else:
                        print(f"Move {dim}, {r}, {c} around X direction 2 times")
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, c)
                else:
                    print("Occupied")
                    self.make_this_place_empty(index_of_opp_color, color, nrow, c)
                    if r == 0 or r == self.n - 1:
                        print(f"Move {dim}, {r}, {c} around Z direction 2 times")
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, r)
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, r)
                    else:
                        print(f"Move {dim}, {r}, {c} around X direction 2 times")
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, c)

            elif dim == index_of_opp_color:
                continue
            else:
                # Back Plane
                if dim == 0:
                    print("Resolving Back Piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(index_of_opp_color, color, r, c):
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, c)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, r, c)
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, c)
                    else:
                        if row == self.n - 1:
                            lrow, lcol = row + 1, col - 1
                            rrow, rcol = row + 1, col + 1
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                            self.make_this_place_empty(index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                        else:
                            if self.is_occupied(index_of_opp_color, color, 0, 1):
                                self.make_this_place_empty(index_of_opp_color, color, 0, 1)
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                            self.make_this_place_empty(index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)

                # Front
                elif dim == 2:
                    print("Resolving Front piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(index_of_opp_color, color, r, c):
                            self.cube_helper.rotate_X(self.scrambled_cube, 1, c);
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, r, c);
                            self.cube_helper.rotate_X(self.scrambled_cube, 1, c);
                    else:
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n - 1)
                        self.make_this_place_empty(index_of_opp_color, color, 1, 2)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, self.n - 1)
                # Left
                elif dim == 4:
                    print("Resolving Left piece...")
                    if c == 0 or c == self.n-1:
                        if not self.is_occupied(index_of_opp_color, color, c, r):
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, c)
                        else:
                            #print("making this place empty...")
                            self.make_this_place_empty(index_of_opp_color, color, c, r)
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, c)
                    else:
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                        piece = self.collect_pieces(color, 1)
                        dim_, r_, c_ = piece[0]
                        if not self.is_occupied(index_of_opp_color, color, c_, r_):
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, c_)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, c_, r_)
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, c_)
                        
               # Right
                elif dim == 5:
                    print("Resolving Right Piece...")
                    if c == 0 or c == self.n-1:
                        if not self.is_occupied(index_of_opp_color, color, self.n-1-c, r):
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, self.n-1-c)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, self.n-1-c, r)
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, self.n-1-c)
                    else:
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, self.n-1)
                        piece = self.collect_pieces(color, 1)
                        dim_, r_, c_ = piece[0]
                        if not self.is_occupied(index_of_opp_color, color, c_, r_):
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, self.n-1-c_)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, self.n-1-c_, r_)
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, self.n-1-c_)

    def solve_level_one(self, color):
        pieces = self.collect_pieces(color, 1)
        if len(pieces) == 0:
            print("Level 1 is completed")
            return 1
        else:
            self.move_center_pieces(pieces, color, 1)
            return 0
cube = Cube(2)
print("Original\n\n")
cube.show_cube()
print("After two move\n\n")
cube.solve_level_one("Yellow")
cube.solve_level_one("Yellow")
cube.solve_level_one("Yellow")
cube.show_cube()
