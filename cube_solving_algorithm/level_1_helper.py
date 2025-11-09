from helper import CubeHelper

class Level_one:
    def __init__(self):
        self.n = 3
        self.opposite_color = {
            "White": "Yellow",
            "Yellow": "White",
            "Red": "Orange",
            "Orange": "Red",
            "Green": "Blue",
            "Blue": "Green",
        }
        self.dirs = {
            "Back": 0,
            "Top": 1,
            "Face": 2,
            "Bottom": 3,
            "Left": 4,
            "Right": 5
        }
        self.colors = {
            "White": 1,
            "Red": 2,
            "Yellow": 3,
            "Orange": 4,
            "Green": 5,
            "Blue": 6,
        }
        self.cube_helper = CubeHelper(self.dirs)
        self.orders = ["Back", "Top", "Front", "Bottom", "Left", "Right"]

    def make_this_place_empty(self, scrambled_cube, index_of_opp_color, color, row, col):
        while self.is_occupied(index_of_opp_color, color, row, col):
            self.cube_helper.rotate_Y(scrambled_cube, -1, 0)

    def find_matching_color(self, scrambled_cube, color):
        for _ in range(len(scrambled_cube)):
            if _ == 1 or _ == 3:
                continue  # skip if Top or Bottom
            if scrambled_cube[_][1][1] == color:
                return _
        return -1

    def get_opposite_color(self, color):
        return self.opposite_color[color]

    def find_color(self, scrambled_cube, color):
        for _ in range(len(scrambled_cube)):
            if scrambled_cube[_][1][1] == self.colors[color]:
                return _
        return -1

    def is_occupied(scrambled_cube, index_of_opp_color, color, r, c):
        return scrambled_cube[index_of_opp_color][r][c] == color

    def move_center_pieces_helper(self, scrambled_cube, pos_of_edge_piece, color, level):
        pieces = pos_of_edge_piece
        opp_color = self.get_opposite_color(color)
        index_of_opp_color = self.find_color(scrambled_cube, opp_color)
        color = self.colors[color]

        for _ in pieces:
            dim, r, c = _
            if dim == 3:
                print("Resolving Bottom Piece...")
                if c == 0 or c == self.n - 1:
                    if not self.is_occupied(scrambled_cube, index_of_opp_color, color, r, c):
                        self.cube_helper.rotate_X(scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(scrambled_cube, 1, c)
                    else:
                        self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, r, c)
                        self.cube_helper.rotate_X(scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(scrambled_cube, 1, c)
                else:
                    if not self.is_occupied(scrambled_cube, index_of_opp_color, color, self.n - 1 - r, c):
                        self.cube_helper.rotate_Z(scrambled_cube, 1, self.n - 1 - r)
                        self.cube_helper.rotate_Z(scrambled_cube, 1, self.n - 1 - r)
                    else:
                        self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, self.n - 1 - r, c)
                        self.cube_helper.rotate_Z(scrambled_cube, 1, self.n - 1 - r)
                        self.cube_helper.rotate_Z(scrambled_cube, 1, self.n - 1 - r)
            elif dim == index_of_opp_color:
                continue
            else:
                if dim == 0:
                    print("Resolving Back Piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, r, c):
                            self.cube_helper.rotate_X(scrambled_cube, -1, c)
                        else:
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, r, c)
                            self.cube_helper.rotate_X(scrambled_cube, -1, c)
                    else:
                        if row == self.n - 1:
                            lrow, lcol = row + 1, col - 1
                            rrow, rcol = row + 1, col + 1
                            self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(scrambled_cube, -1, 0)
                        else:
                            if self.is_occupied(scrambled_cube, index_of_opp_color, color, 0, 1):
                                self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, 0, 1)
                            self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(scrambled_cube, -1, 0)
                elif dim == 2:
                    print("Resolving Front piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, r, c):
                            self.cube_helper.rotate_X(scrambled_cube, 1, c)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, r, c)
                            self.cube_helper.rotate_X(scrambled_cube, 1, c)
                    else:
                        self.cube_helper.rotate_Z(scrambled_cube, 1, self.n - 1)
                        self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, 1, 2)
                        self.cube_helper.rotate_X(scrambled_cube, 1, self.n - 1)
                elif dim == 4:
                    print("Resolving Left piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, c, r):
                            self.cube_helper.rotate_Z(scrambled_cube, -1, c)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, c, r)
                            self.cube_helper.rotate_Z(scrambled_cube, 1, c)
                    else:
                        self.cube_helper.rotate_X(scrambled_cube, -1, 0)
                        piece = self.collect_pieces(color, 1)
                        dim_, r_, c_ = piece[0]
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, c_, r_):
                            self.cube_helper.rotate_Z(scrambled_cube, 1, c_)
                        else:
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, c_, r_)
                            self.cube_helper.rotate_Z(scrambled_cube, 1, c_)
                elif dim == 5:
                    print("Resolving Right Piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, self.n - 1 - c, r):
                            self.cube_helper.rotate_Z(scrambled_cube, -1, self.n - 1 - c)
                        else:
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, self.n - 1 - c, r)
                            self.cube_helper.rotate_Z(scrambled_cube, -1, self.n - 1 - c)
                    else:
                        self.cube_helper.rotate_X(scrambled_cube, 1, self.n - 1)
                        piece = self.collect_pieces(color, 1)
                        dim_, r_, c_ = piece[0]
                        if not self.is_occupied(scrambled_cube, index_of_opp_color, color, c_, r_):
                            self.cube_helper.rotate_Z(scrambled_cube, -1, self.n - 1 - c_)
                        else:
                            self.make_this_place_empty(scrambled_cube, index_of_opp_color, color, self.n - 1 - c_, r_)
                            self.cube_helper.rotate_Z(scrambled_cube, -1, self.n - 1 - c_)

    
    def handle_when_centre_dont_matched(self, scrambled_cube, index_of_color, index_of_matching_color):
        com = [index_of_color, index_of_matching_color]
        com.sort()
        print(com)
        if com[0] == 0 and com[1] == 4:
            #print("Left and Back")
             if index_of_color > index_of_matching_color:
                 # left to back
                 print("Rotating from left to back")
                 self.cube_helper.rotate_Y(scrambled_cube, -1, 0)
                 self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                 self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
             else:
                 # Back to Left
                 print("Rotating from back to left")
                 self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                 self.cube_helper.rotate_X(scrambled_cube, 1, 0)
                 self.cube_helper.rotate_X(scrambled_cube, 1, 0)
        elif com[0] == 2 and com[1] == 4:
            #print("Left and Face")
            if index_of_color > index_of_matching_color:
                # Left to Face
                print("Rotating from left to face")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
            else:
                # Face to Left
                print("Rotating from face to left")
                self.cube_helper.rotate_Y(scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)
        elif com[0] == 4 and com[1] == 5:
            #print("Left and Right")
            if index_of_color < index_of_matching_color:
                # Left to Right
                print("Rotating from left to right")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
            else:
                # Right to Left
                print("Rotating from right to left")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)

        elif com[0] == 0 and com[1] == 5:
            #print("Back and Right")
            if index_of_color < index_of_matching_color:
                # Back to right
                print("Rotating from back to right")
                self.cube_helper.rotate_Y(scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
            else:
                # Right to Back
                print("Rotating from right to back")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
        elif com[0] == 0 and com[1] == 2:
            #print("Back and Face")
            if index_of_color < index_of_matching_color:
                # Back to Face
                print("Rotating from back to face")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
            else:
                #Face to Back
                print("Rotating from face to back")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
        elif com[0] == 2 and com[1] == 5:
            #print("Right and Face")
            if index_of_color > index_of_matching_color:
                # Right to Face
                print("Rotating from right to face")
                self.cube_helper.rotate_Y(scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
            else:
                # Face to Right
                print("Rotating from face to right")
                self.cube_helper.rotate_Y(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1 ,2)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
        else:
            print("Invalid...")
 



    def helper_of_edge_to_bottom(self, scrambled_cube, piece, index_of_opp_color_, color_):
        pieces = piece
        print(pieces)
        index_of_opp_color = index_of_opp_color_
        color = color_
        dim, r, c = pieces
        if r == 0:
            # It is connected to back [row = 2 and col = c]
            back_color = scrambled_cube[0][2][c]
            # print("Back color "+str(back_color))
            index_of_back_color = self.find_matching_color(scrambled_cube, back_color)
            if index_of_back_color == 0:  # index of back is 0
                print("Already matched...")
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 0)
            else:
                print("Not matched...")

                print(index_of_back_color)
                self.handle_when_centre_dont_matched(scrambled_cube, 0, index_of_back_color)
        elif r == self.n - 1:
            # It is connected to Front face [row = 0 and col = c]
            face_color = scrambled_cube[2][0][c]
            # print("Face color "+str(face_color))
            index_of_face_color = self.find_matching_color(scrambled_cube, face_color)
            if index_of_face_color == 2:  # index of face is 2
                print("Already matched...")
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(scrambled_cube, 1, 2)
            else:
                print("Not matched...")
                print(index_of_face_color)
                self.handle_when_centre_dont_matched(scrambled_cube, 2, index_of_face_color)
        elif c == 0:
            # It is connected to left piece
            left_color = scrambled_cube[4][c][r]
            # print("Left color "+str(left_color))
            index_of_left_color = self.find_matching_color(scrambled_cube, left_color)
            if index_of_left_color == 4:  # index of left is 4
                print("Already matched...")
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(scrambled_cube, 1, 0)
            else:
                print("Not matched...")
                print(index_of_left_color)
                self.handle_when_centre_dont_matched(scrambled_cube, 4, index_of_left_color)
        else:
            # It is connected to right piece
            right_color = scrambled_cube[5][1][0]
            # print("Right color "+str(right_color))
            index_of_right_color = self.find_matching_color(scrambled_cube, right_color)
            if index_of_right_color == 5:  # index of right color is 5
                print("Already matched...")
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(scrambled_cube, 1, 2)
            else:
                print("Not matched...")
                print(index_of_right_color)
                self.handle_when_centre_dont_matched(scrambled_cube, 5, index_of_right_color)

