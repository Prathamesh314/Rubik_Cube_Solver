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
                [4, 4, 2],
                [2, 5, 6],
                [2, 2, 4]
            ],
            # Top
            [
                [6, 3, 1],
                [1, 1, 2],
                [2, 2, 5]
            ],
            # Front
            [
                [5, 5, 4],
                [3, 6, 6],
                [3, 1, 3]
            ],
            # Bottom
            [
                [5, 4, 4],
                [5, 3, 6],
                [5, 3, 1]
            ],
            # Left
            [
                [3, 5, 1],
                [6, 2, 5],
                [1, 4, 2]
            ],
            # Right
            [
                [3, 1, 6],
                [3, 4, 4],
                [6, 1, 6]
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
            dim, r, c = _;print(r)
            if dim == 3:
                print("Resolving Bottom Piece...")
                if c == 0 or c == self.n-1:
                    if not self.is_occupied(index_of_opp_color, color, r, c):
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                    else:
                        self.make_this_place_empty(index_of_opp_color, color, r, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                else:
                    if not self.is_occupied(index_of_opp_color, color, self.n-1-r, c):
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n-1-r)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n-1-r)
                    else:
                        self.make_this_place_empty(index_of_opp_color, color, self.n-1-r, c)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n-1-r)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n-1-r)

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


    def collect_pieces2(self, index_of_opp_color, color):
        if self.scrambled_cube[index_of_opp_color][0][1] == color:
            return [index_of_opp_color, 0, 1]
        elif self.scrambled_cube[index_of_opp_color][1][2] == color:
            return [index_of_opp_color, 1, 2]
        elif self.scrambled_cube[index_of_opp_color][1][0] == color:
            return [index_of_opp_color, 1, 0]
        elif self.scrambled_cube[index_of_opp_color][2][1] == color:
            return [index_of_opp_color, 2, 1]
        return []

    


    def find_matching_color(self, color):
        for _ in range(len(self.scrambled_cube)):
            if _ == 1 or _ == 3:
                continue # skip if Top or Bottom
            if self.scrambled_cube[_][1][1] == color:
                return _;
        return -1


    def handle_when_centre_dont_matched(self, index_of_color, index_of_matching_color):
        com = [index_of_color, index_of_matching_color]
        com.sort()
        if com[0] == 0 and com[1] == 4:
            #print("Left and Back")
             if index_of_color > index_of_matching_color:
                 # left to back
                 print("Rotating from left to back")
                 self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                 self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                 self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
             else:
                 # Back to Left
                 print("Rotating from back to left")
                 self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                 self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                 self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
        elif com[0] == 2 and com[1] == 4:
            #print("Left and Face")
            if index_of_color > index_of_matching_color:
                # Left to Face
                print("Rotating from left to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            else:
                # Face to Left
                print("Rotating from face to left")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
        elif com[0] == 4 and com[1] == 5:
            #print("Left and Right")
            if index_of_color < index_of_matching_color:
                # Left to Right
                print("Rotating from left to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            else:
                # Right to Left
                print("Rotating from right to left")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)

        elif com[0] == 0 and com[1] == 5:
            #print("Back and Right")
            if index_of_color < index_of_matching_color:
                # Back to right
                print("Rotating from back to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            else:
                # Right to Back
                print("Rotating from right to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
        elif com[0] == 0 and com[1] == 2:
            #print("Back and Face")
            if index_of_color < index_of_matching_color:
                # Back to Face
                print("Rotating from back to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            else:
                #Face to Back
                print("Rotating from face to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
        elif com[0] == 2 and com[1] == 5:
            #print("Right and Face")
            if index_of_color > index_of_matching_color:
                # Right to Face
                print("Rotating from right to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            else:
                # Face to Right
                print("Rotating from face to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1 ,2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
        else:
            print("Inavlid...")


    def helper_of_edge_to_bottom(self, piece, index_of_opp_color_, color_):
        pieces = piece
        print(pieces)
        index_of_opp_color = index_of_opp_color_
        color = color_
        dim, r, c = pieces
        if r == 0:
            # It is connected to back [row = 2 and col = c]
            back_color = self.scrambled_cube[0][2][c]
            print("Back color "+str(back_color))
            index_of_back_color = self.find_matching_color(back_color)
            if index_of_back_color == 0: # index of back is 0
                print("Already matched...")
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(0, index_of_back_color)
        elif r == self.n-1:
            # It is connected to Front face [row = 0 and col = c]
            face_color = self.scrambled_cube[2][0][c]
            print("Face color "+str(face_color))
            index_of_face_color = self.find_matching_color(face_color)
            if index_of_face_color ==  2: # index of face is 2
                print("Already matched...")
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(2, index_of_face_color)
        elif c == 0:
            # It is connected to left piece
            left_color = self.scrambled_cube[4][c][r]
            #print("Left color "+str(left_color))
            index_of_left_color = self.find_matching_color(left_color)
            if index_of_left_color == 4: # index of left is 4
                print("Already matched...")
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(4, index_of_left_color)
        else:
            # It is connected to right piece
            right_color = self.scrambled_cube[5][1][0]
            #print("Right color "+str(right_color))
            index_of_right_color = self.find_matching_color(right_color)
            if index_of_right_color == 5: # index of right color is 5
                print("Already matched...")
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(5, index_of_right_color)

    def bring_edge_pieces_to_bottom(self, color):
        opp_color = self.get_opposite_color(color)
        index_of_opp_color =  self.find_color(opp_color)
        index_of_color = self.find_color(color)
        piece = self.collect_pieces2(index_of_opp_color, index_of_color)
        #print(opp_color, index_of_opp_color, piece)
        if len(piece) == 0:
            print("Task completed...")
            return 1
        else:
            self.helper_of_edge_to_bottom(piece, index_of_opp_color, color)
            return 0


    def solve_level_one(self, color):
        pieces = self.collect_pieces(color, 1)
        #print(pieces)
        if len(pieces) == 0:
            print("Level 1 is completed")
            return 1
        else:
            self.move_center_pieces(pieces, color, 1)
            return 0
cube = Cube(2)
print("Original\n\n")
cube.show_cube()
print("After one move\n\n")
cube.solve_level_one("Yellow")
#cube.show_cube()
print("\n\nAfter two move \n\n")
cube.solve_level_one("Yellow")
#cube.show_cube()
print("\n\nAfter 3rd move \n\n")
cube.solve_level_one("Yellow") 
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
print("One edge piece is now at correct position")
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
print("Secoond edge is now at its correct position")
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
cube.show_cube()
cube.bring_edge_pieces_to_bottom("Yellow")
