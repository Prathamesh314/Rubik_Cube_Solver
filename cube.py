# print("Hello WHere's the code with corrected indentation:

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

        self.dirs = {"Back": 0, "Top": 1, "Face": 2, "Bottom": 3, "Left": 4, "Right": 5}

        self.opposite_color = {
            "White": "Yellow",
            "Yellow": "White",
            "Red": "Orange",
            "Orange": "Red",
            "Green": "Blue",
            "Blue": "Green",
        }

        self.top_layer = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ]

        self.orders = ["Back", "Top", "Front", "Bottom", "Left", "Right"]
        self.scrambled_cube = []
        self.build_cube(number)
        self.build_scramble_cube()
        self.cube_helper = CubeHelper(self.dirs)
        self.n = 3

    def build_cube(self, number):
        # order will be Face, Top, Back, Bottom, Right, Left
        # This cube is of type 1 where blue is at top and white is at front and orange is at right
        self.cube = [
            [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            [[2, 2, 2], [2, 2, 2], [2, 2, 2]],
            [[3, 3, 3], [3, 3, 3], [3, 3, 3]],
            [[4, 4, 4], [4, 4, 4], [4, 4, 4]],
            [[5, 5, 5], [5, 5, 5], [5, 5, 5]],
            [[6, 6, 6], [6, 6, 6], [6, 6, 6]],
        ]

    def build_scramble_cube(self):
        self.scrambled_cube = [
            # Back
            [[5, 5, 5], [5, 5, 5], [1, 5, 1]],
            # Top
            [[2, 1, 5], [1, 1, 1], [5, 1, 4]],
            # Front
            [[2, 2, 6], [6, 6, 6], [6, 6, 6]],
            # Bottom
            [[3, 3, 3], [3, 3, 3], [3, 3, 3]],
            # Left
            [[6, 4, 1], [4, 4, 4], [4, 4, 4]],
            # Right
            [[1, 6, 4], [2, 2, 2], [2, 2, 2]],
        ]

    def show_cube(self):
        color_indices = {}
        for i, j in self.colors.items():
            color_indices[j] = i
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
        print(color)
        color = 3
        # print(color)
        for i in range(size):
            if i == 1:
                continue
            for j in range(n):
                for k in range(m):
                    if self.scrambled_cube[i][j][k] == color and j != k:
                        if (
                            j == 0
                            and k == 0
                            or j == 0
                            and k == n - 1
                            or j == n - 1
                            and k == 0
                            or j == n - 1
                            and k == m - 1
                        ):
                            continue
                        if (
                            k == 0
                            and j == 0
                            or k == 0
                            and j == n - 1
                            or k == m - 1
                            and j == 0
                            or k == m - 1
                            and j == n - 1
                        ):
                            continue
                        # desired_piece_locs.add((i, j, k))
                        return [(i, j, k)]
        return []

    def get_opposite_color(self, color):
        return self.opposite_color[color]

    def find_color(self, color):
        for _ in range(len(self.scrambled_cube)):
            if self.scrambled_cube[_][1][1] == self.colors[color]:
                return _
        return -1

    def is_occupied(self, index_of_opp_color, color, r, c):
        return self.scrambled_cube[index_of_opp_color][r][c] == color

    def make_this_place_empty(self, index_of_opp_color, color, row, col):
        while self.is_occupied(index_of_opp_color, color, row, col):
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)

    def move_center_pieces(self, pos_of_edge_piece, color, level):
        pieces = pos_of_edge_piece
        opp_color = self.get_opposite_color(color)
        index_of_opp_color = self.find_color(opp_color)
        color = self.colors[color]
        print(pieces)
        # print(opp_color)
        # print(self.find_index_of_opposite_color(opp_color))
        for _ in pieces:
            dim, r, c = _
            print(r)
            if dim == 3:
                print("Resolving Bottom Piece...")
                if c == 0 or c == self.n - 1:
                    if not self.is_occupied(index_of_opp_color, color, r, c):
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        # if c== 0:
                        #    self.scrambled_cube[0][0][c], self.scrambled_cube[0][2][c] = self.scrambled_cube[0][2][c], self.scrambled_cube[0][0][c]
                        # self.scrambled_cube[3][0][c], self.scrambled_cube[3][2][c] = self.scrambled_cube[3][2][c], self.scrambled_cube[3][0][c]
                    else:
                        self.make_this_place_empty(index_of_opp_color, color, r, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                else:
                    if not self.is_occupied(
                        index_of_opp_color, color, self.n - 1 - r, c
                    ):
                        self.cube_helper.rotate_Z(
                            self.scrambled_cube, 1, self.n - 1 - r
                        )
                        self.cube_helper.rotate_Z(
                            self.scrambled_cube, 1, self.n - 1 - r
                        )
                    else:
                        self.make_this_place_empty(
                            index_of_opp_color, color, self.n - 1 - r, c
                        )
                        self.cube_helper.rotate_Z(
                            self.scrambled_cube, 1, self.n - 1 - r
                        )
                        self.cube_helper.rotate_Z(
                            self.scrambled_cube, 1, self.n - 1 - r
                        )

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
                        if r == self.n - 1:
                            lrow, lcol = r + 1, c - 1
                            rrow, rcol = r + 1, c + 1
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                            self.make_this_place_empty(index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                        else:
                            if self.is_occupied(index_of_opp_color, color, 0, 1):
                                self.make_this_place_empty(
                                    index_of_opp_color, color, 0, 1
                                )
                            print("Rotating in Z direction")
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                            self.make_this_place_empty(index_of_opp_color, color, 1, 0)
                            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)

                # Front
                elif dim == 2:
                    print("Resolving Front piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(index_of_opp_color, color, r, c):
                            self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                        else:
                            self.make_this_place_empty(index_of_opp_color, color, r, c)
                            self.cube_helper.rotate_X(self.scrambled_cube, 1, c)
                    else:
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, self.n - 1)
                        self.make_this_place_empty(index_of_opp_color, color, 1, 2)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, self.n - 1)
                # Left
                elif dim == 4:
                    print("Resolving Left piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(index_of_opp_color, color, c, r):
                            self.cube_helper.rotate_Z(self.scrambled_cube, -1, c)
                        else:
                            # print("making this place empty...")
                            self.make_this_place_empty(index_of_opp_color, color, c, r)
                            self.cube_helper.rotate_Z(self.scrambled_cube, 1, c)
                    else:
                        # self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                        # piece = self.collect_pieces(color, 1)
                        # dim_, r_, c_ = piece[0]
                        self.make_this_place_empty(index_of_opp_color, color, 1, 0)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                        self.make_this_place_empty(index_of_opp_color, color, 2, 1)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                        # if not self.is_occupied(index_of_opp_color, color, c_, r_):
                        # self.cube_helper.rotate_Z(self.scrambled_cube, 1, c_)
                        # else:
                        # self.make_this_place_empty(index_of_opp_color, color, c_, r_)
                        # self.cube_helper.rotate_Z(self.scrambled_cube, 1, c_)

                # Right
                elif dim == 5:
                    print("Resolving Right Piece...")
                    if c == 0 or c == self.n - 1:
                        if not self.is_occupied(
                            index_of_opp_color, color, self.n - 1 - c, r
                        ):
                            self.cube_helper.rotate_Z(
                                self.scrambled_cube, -1, self.n - 1 - c
                            )
                        else:
                            self.make_this_place_empty(
                                index_of_opp_color, color, self.n - 1 - c, r
                            )
                            self.cube_helper.rotate_Z(
                                self.scrambled_cube, -1, self.n - 1 - c
                            )
                        # self.scrambled_cube[4][0][2], self.scrambled_cube[4][2][2] = self.scrambled_cube[4][2][2], self.scrambled_cube[4][0][2]
                        # self.scrambled_cube[5][0][0], self.scrambled_cube[5][2][0] = self.scrambled_cube[5][2][0], self.scrambled_cube[5][0][0]
                    else:
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, self.n - 1)
                        piece = self.collect_pieces(color, 1)
                        dim_, r_, c_ = piece[0]
                        if not self.is_occupied(index_of_opp_color, color, c_, r_):
                            self.cube_helper.rotate_Z(
                                self.scrambled_cube, -1, self.n - 1 - c_
                            )
                        else:
                            self.make_this_place_empty(
                                index_of_opp_color, color, self.n - 1 - c_, r_
                            )
                            self.cube_helper.rotate_Z(
                                self.scrambled_cube, -1, self.n - 1 - c_
                            )

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
                continue  # skip if Top or Bottom
            if self.scrambled_cube[_][1][1] == color:
                return _
        return -1

    def handle_when_centre_dont_matched(self, index_of_color, index_of_matching_color):
        com = [index_of_color, index_of_matching_color]
        com.sort()
        if com[0] == 0 and com[1] == 4:
            # print("Left and Back")
            if index_of_color > index_of_matching_color:
                # left to back
                print("Rotating from left to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[3][2] = self.scrambled_cube[3][2][::-1]
            else:
                # Back to Left
                print("Rotating from back to left")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                # temp = self.scrambled_cube[3][0][0]
                # self.scrambled_cube[3][0][0] = self.scrambled_cube[3][2][0]
                # self.scrambled_cube[3][2][0] = temp
                # temp = self.scrambled_cube[0][0][0]
                # self.scrambled_cube[0][0][0] = self.scrambled_cube[0][2][0]
                # self.scrambled_cube[0][2][0] = temp

        elif com[0] == 2 and com[1] == 4:
            # print("Left and Face")
            if index_of_color > index_of_matching_color:
                # Left to Face
                print("Rotating from left to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                # self.scrambled_cube[3][0] = self.scrambled_cube[3][0][::-1]
            else:
                # Face to Left
                print("Rotating from face to left")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                # temp  =[]
                # for i in range(3):
                #    temp.append(self.scrambled_cube[3][i][0])
                # temp[::-1]
                # for i in range(3):
                #   self.scrambled_cube[3][i][0] = temp[i]

        elif com[0] == 4 and com[1] == 5:
            # print("Left and Right")
            if index_of_color < index_of_matching_color:
                # Left to Right
                print("Rotating from left to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[4][0] = self.scrambled_cube[4][0][::-1]
                # self.scrambled_cube[5][0] = self.scrambled_cube[5][0][::-1]
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                # temp = []
                # for i in range(3):
                #   temp.append(self.scrambled_cube[3][i][2])
                # temp[::-1]
                # for i in range(3):
                #   self.scrambled_cube[3][i][2] = temp[i]
                # temp = []
                # for i in range(3):
                #    temp.append(self.scrambled_cube[1][i][2])

                # for i in range(3):
                #    self.scrambled_cube[1][i][2] = temp[i]

            else:
                # Right to Left
                print("Rotating from right to left")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[4][0] = self.scrambled_cube[4][0][::-1]
                # self.scrambled_cube[5][0] = self.scrambled_cube[5][0][::-1]
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                # temp = []
                # for i in range(3):
                #    temp.append(self.scrambled_cube[1][i][0])
                # temp[::-1]
                # for i in range(3):
                #    self.scrambled_cube[1][i][0] = temp[i]

                # temp = []
                # for i in range(3):
                #    temp.append(self.scrambled_cube[3][i][0])
                # temp[::-1]
                # for i in range(3):
                #    self.scrambled_cube[3][i][0] = temp[i]

        elif com[0] == 0 and com[1] == 5:
            # print("Back and Right")
            if index_of_color < index_of_matching_color:
                # Back to right
                print("Rotating from back to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                # temp = []
                # for i in range(3):
                #    temp.append(self.scrambled_cube[1][i][2])
                # temp[::-1]

                # for i in range(3):
                #    self.scrambled_cube[1][i][2] = temp[i]

                # temp = []
                # for i in range(3):
                #    temp.append(self.scrambled_cube[3][i][2])
                # temp[::-1]
                # for i in range(3):
                #    self.scrambled_cube[3][i][2] = temp[i]

            else:
                # Right to Back
                print("Rotating from right to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[1][0] = self.scrambled_cube[1][0][::-1]
                # self.scrambled_cube[1][2] = self.scrambled_cube[1][2][::-1]

        elif com[0] == 0 and com[1] == 2:
            # print("Back and Face")
            if index_of_color < index_of_matching_color:
                # Back to Face
                print("Rotating from back to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[2][0] = self.scrambled_cube[2][0][::-1]
                # self.scrambled_cube[0][0] = self.scrambled_cube[0][0][::-1]
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                # self.scrambled_cube[1][2] = self.scrambled_cube[1][2][::-1]
                # self.scrambled_cube[3][0] = self.scrambled_cube[3][0][::-1]

            else:
                # Face to Back
                print("Rotating from face to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[0][0] = self.scrambled_cube[0][0][::-1]
                # self.scrambled_cube[2][0] = self.scrambled_cube[2][0][::-1]
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[1][0] = self.scrambled_cube[1][0][::-1]
                # self.scrambled_cube[3][2] = self.scrambled_cube[3][2][::-1]
        elif com[0] == 2 and com[1] == 5:
            # print("Right and Face")
            if index_of_color > index_of_matching_color:
                # Right to Face
                print("Rotating from right to face")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                # self.scrambled_cube[1][2] = self.scrambled_cube[1][2][::-1]
                # self.scrambled_cube[3][0] = self.scrambled_cube[3][0][::-1]
            else:
                # Face to Right
                print("Rotating from face to right")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                temp = []
                for i in range(3):
                    temp.append(self.scrambled_cube[1][i][2])
                temp[::-1]
                for i in range(3):
                    self.scrambled_cube[1][i][2] = temp[i]

                temp = []
                for i in range(3):
                    temp.append(self.scrambled_cube[3][i][2])
                temp[::-1]
                for i in range(3):
                    self.scrambled_cube[3][i][2] = temp[i]
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
            print("Back color " + str(back_color))
            index_of_back_color = self.find_matching_color(back_color)
            if index_of_back_color == 0:  # index of back is 0
                print("Already matched...")
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[1][0] = self.scrambled_cube[1][0][::-1]
                # self.scrambled_cube[3][2] = self.scrambled_cube[3][2][::-1]
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(0, index_of_back_color)
        elif r == self.n - 1:
            # It is connected to Front face [row = 0 and col = c]
            face_color = self.scrambled_cube[2][0][c]
            print("Face color " + str(face_color))
            index_of_face_color = self.find_matching_color(face_color)
            if index_of_face_color == 2:  # index of face is 2
                print("Already matched...")
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                print("I am here...")
            # self.scrambled_cube[1][2] = self.scrambled_cube[1][2][::-1]
            # self.scrambled_cube[3][0] = self.scrambled_cube[3][0][::-1]
            # self.scrambled_cube[1][2][0], self.scrambled_cube[1][2][2] = self.scrambled_cube[1][2][2], self.scrambled_cube[1][2][0]
            #               self.scrambled_cube[3][0][0], self.scrambled_cube[3][0][2] = self.scrambled_cube[3][0][2], self.scrambled_cube[3][0][0]
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(2, index_of_face_color)
        elif c == 0:
            # It is connected to left piece
            left_color = self.scrambled_cube[4][c][r]
            # print("Left color "+str(left_color))
            index_of_left_color = self.find_matching_color(left_color)
            if index_of_left_color == 4:  # index of left is 4
                print("Already matched...")
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                # self.scrambled_cube[3][0][0], self.scrambled_cube[3][2][0] = self.scrambled_cube[3][2][0], self.scrambled_cube[3][0][0]
                # temp = []
                # for i in range(3):
            #                   temp.append(self.scrambled_cube[1][i][0])
            #                temp[::-1]
            #               for i in range(3):
            #                   self.scrambled_cube[1][i][0] = temp[i]
            #
            #               temp = []
            #               for i in range(3):
            #                   temp.append(self.scrambled_cube[3][i][0])
            #               temp[::-1]
            #                for i in range(3):
            #                   self.scrambled_cube[3][i][0] = temp[i]

            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(4, index_of_left_color)
        else:
            # It is connected to right piece
            right_color = self.scrambled_cube[5][0][1]
            # print("Right color "+str(right_color))
            index_of_right_color = self.find_matching_color(right_color)
            if index_of_right_color == 5:  # index of right color is 5
                print("Already matched...")
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                temp = []
                for i in range(3):
                    temp.append(self.scrambled_cube[1][i][2])
                temp[::-1]
                for i in range(3):
                    self.scrambled_cube[1][i][2] = temp[i]

                temp = []
                for i in range(3):
                    temp.append(self.scrambled_cube[3][i][2])
                temp[::-1]
                for i in range(3):
                    self.scrambled_cube[3][i][2] = temp[i]
            else:
                print("Not matched...")
                self.handle_when_centre_dont_matched(5, index_of_right_color)

    def bring_edge_pieces_to_bottom(self, color):
        opp_color = self.get_opposite_color(color)
        index_of_opp_color = self.find_color(opp_color)
        index_of_color = self.find_color(color)
        piece = self.collect_pieces2(index_of_opp_color, index_of_color)
        # print(opp_color, index_of_opp_color, piece)
        if len(piece) == 0:
            print("Task completed...")
            return 1
        else:
            self.helper_of_edge_to_bottom(piece, index_of_opp_color, color)
            return 0

    def solve_level_one(self, color):
        pieces = self.collect_pieces(color, 1)
        # print(pieces)
        if len(pieces) == 0:
            print("Level 1 is completed")
            return 1
        else:
            self.move_center_pieces(pieces, color, 1)
            return 0

    def collect_pieces3(self, color):
        for _ in range(len(self.scrambled_cube)):
            if _ == 3:
                continue
            for i in range(len(self.scrambled_cube[0])):
                for j in range(len(self.scrambled_cube[0][0])):
                    if (
                        (i == 0 and j == 0)
                        or (i == 0 and j == 2)
                        or (i == 2 and j == 0)
                        or (i == 2 and j == 2)
                    ):
                        if self.scrambled_cube[_][i][j] == self.colors[color]:
                            return [_, i, j]
        return []

    def find_dimensions(self, color):
        for _ in range(len(self.scrambled_cube)):
            if self.scrambled_cube[_][1][1] == color:
                return _
        return -1

    def find_centres_of_two_colors(self, dim, color1, color2):
        print(f"Two colors are: {color1} and {color2}")
        if color1 == 2 and color2 == 5:
            # Red -> Green
            dimc1, dimc2 = self.find_dimensions(color1), self.find_dimensions(color2)
            print(
                f"Current dimensions: {dim}, Color1 dimension: {dimc1}, Color2 dimension: {dimc2}"
            )
            if dimc2 == 0:
                # take it to the back
                print("Taking it back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                # self.scrambled_cube[1][0][2], self.scrambled_cube[1][2][2] = self.scrambled_cube[1][2][2], self.scrambled_cube[1][0][2]
                # self.scrambled_cube[0][0][2], self.scrambled_cube[0][2][2] = self.scrambled_cube[0][2][2], self.scrambled_cube[0][0][2]
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            elif dimc2 == 4:
                # take it to the left
                pass
            elif dimc2 == 5:
                # take it to right
                pass
            else:
                print("Invalid")
        elif color1 == 5 and color2 == 2:
            pass
        elif color1 == 2 and color2 == 6:
            pass
        elif color1 == 6 and color2 == 2:
            pass
        elif color1 == 4 and color2 == 6:
            pass
        elif color1 == 6 and color2 == 4:
            pass
        elif color1 == 4 and color2 == 5:
            pass
        elif color1 == 5 and color2 == 4:
            pass
        else:
            print("Inavlid")

    def handle_top_facers(self, piece, color):
        dim, r, c = piece
        if dim == 1:
            print("Handling top facing...")
            # Top facing
            if c == 2:
                print("I am at last col")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                self.handle_front_facers([4, 0, 0], color)
            elif c == 0:
                print("I am at first col")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                if r == 0:
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                else:
                    pass
                # self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)

                # self.handle_corner_pieces(color)

        elif dim == 3:
            # Down facing
            print("Handling down facing...")

    def handle_front_facers(self, piece, color):
        dim, r, c = piece
        # print(piece)
        if dim == 4:
            # Left side
            print("Handling Left cornered piece")
            self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
        elif dim == 5:
            # Right side
            if r == 0:
                print("Handling right cornered piece")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)

        piece = self.collect_pieces3(color)
        dim, r, c = piece
        print(piece)
        if dim == 1 or dim == 3:
            self.handle_top_facers(piece, color)
            return

        if dim == 0:
            print("Handling back cornered piece...")
            print("I am at back...")
            if c == 0:
                print("I am at left....")
                if r == 2:
                    print("I am at bottom")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    up_color = self.scrambled_cube[1][2][2]
                    right_color = self.scrambled_cube[5][0][0]
                    # print(up_color, right_color)
                    if (
                        self.scrambled_cube[2][1][1] == up_color
                        and self.scrambled_cube[5][1][1] == right_color
                    ):
                        # corner piece lies between front and right face
                        print("i lie between front and right... -> corner piece")
                        self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    elif (
                        self.scrambled_cube[4][1][1] == up_color
                        and self.scrambled_cube[2][1][1] == right_color
                    ):
                        # corner piece lies between front and left piece
                        print("I lie between front and left piece... -> corner piece")
                        self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                    elif (
                        self.scrambled_cube[4][1][1] == right_color
                        and self.scrambled_cube[0][1][1] == up_color
                    ):
                        # corner piece lies between left and back
                        pass
                    elif (
                        self.scrambled_cube[5][1][1] == up_color
                        and self.scrambled_cube[0][1][1] == right_color
                    ):
                        # corner piece lies between back and right
                        print("I lie between back and right... -> corner piece")
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                else:
                    print("I am at top")
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                    self.handle_front_facers([0, 2, 0], color)
            else:
                print("I am at right....")
                if r == 2:
                    print("I am at bottom...")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    up_color = self.scrambled_cube[1][2][0]
                    left_color = self.scrambled_cube[4][0][2]
                    if (
                        left_color == self.scrambled_cube[2][1][1]
                        and up_color == self.scrambled_cube[5][1][1]
                    ):
                        print("I am at front and right....")
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                        self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                        self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                    elif (
                        left_color == self.scrambled_cube[4][1][1]
                        and up_color == self.scrambled_cube[2][1][1]
                    ):
                        print("I am at left and front....")
                    elif (
                        left_color == self.scrambled_cube[0][1][1]
                        and up_color == self.scrambled_cube[4][1][1]
                    ):
                        print("I am at back and left....")
                    elif (
                        left_color == self.scrambled_cube[5][1][1]
                        and up_color == self.scrambled_cube[0][1][1]
                    ):
                        print("I am at right and back....")
                else:
                    print("I am at top...")
                # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                # self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                # self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                # self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            return

        if c == 0:
            # Left Cornered
            if r == 0:
                # top
                print("Handling left-top cornered...")
                up_color = self.scrambled_cube[1][2][0]
                left_color = self.scrambled_cube[4][0][2]
                if (
                    self.scrambled_cube[2][1][1] == up_color
                    and self.scrambled_cube[4][1][1] == left_color
                ):
                    # if cornere pieces lies between left and front pieces
                    print("I will be at left and front")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                    # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                    # self.scrambled_cube[1][0][0], self.scrambled_cube[1][2][0] = self.scrambled_cube[1][2][0], self.scrambled_cube[1][0][0]
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                    # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                    # self.scrambled_cube[1][0][0], self.scrambled_cube[1][2][0] = self.scrambled_cube[1][2][0], self.scrambled_cube[1][0][0]
                elif (
                    self.scrambled_cube[2][1][1] == left_color
                    and self.scrambled_cube[5][1][1] == up_color
                ):
                    # if corner piece lies between front and right pieces
                    print("I will be at right and front")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                    # self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                elif (
                    self.scrambled_cube[4][1][1] == up_color
                    and self.scrambled_cube[0][1][1] == left_color
                ):
                    # if corner piece lies between left and back
                    print("I will be at left and back")
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    # self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
                    # self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    # self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                    # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                    # self.scrambled_cube[1][0][0], self.scrambled_cube[1][2][0] = self.scrambled_cube[1][2][0], self.scrambled_cube[1][0][0]
                    # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    # self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                    # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                    # self.scrambled_cube[1][0][0], self.scrambled_cube[1][2][0] = self.scrambled_cube[1][2][0], self.scrambled_cube[1][0][0]
                elif (
                    self.scrambled_cube[0][1][1] == up_color
                    and self.scrambled_cube[5][1][1] == left_color
                ):
                    # if corner piece lies between back and right_color
                    print("I will be at back and right")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            else:
                # Bottom
                print("Handling left-bottom cornered...")
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.handle_front_facers([5, 0, 0], color)
                # self.scrambled_cube[1][0][0], self.scrambled_cube[1][2][0] = self.scrambled_cube[1][2][0], self.scrambled_cube[1][0][0]
                # self.scrambled_cube[0][0][0], self.scrambled_cube[0][2][0] = self.scrambled_cube[0][2][0], self.scrambled_cube[0][0][0]
        else:
            # Right Cornered
            if r == 0:
                # Top
                print("Handling Right-top cornered...")
                up_color = self.scrambled_cube[1][2][2]
                right_color = self.scrambled_cube[5][0][0]
                if (
                    self.scrambled_cube[4][1][1] == up_color
                    and self.scrambled_cube[2][1][1] == right_color
                ):
                    # piece will lie between left and face
                    print("I am left and face")
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                elif (
                    self.scrambled_cube[2][1][1] == up_color
                    and self.scrambled_cube[5][1][1] == right_color
                ):
                    # piece will lie between front and right
                    print("I am face and right")
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                elif (
                    self.scrambled_cube[0][1][1] == up_color
                    and self.scrambled_cube[5][1][1] == right_color
                ):
                    # piece will lie between right and back
                    print("I am right and back")
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                elif (
                    self.scrambled_cube[0][1][1] == up_color
                    and self.scrambled_cube[4][1][1] == right_color
                ):
                    # piece will lie between left and back
                    print("I am left and back")
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
            else:
                # Bottom
                print("Handling Right-bottom cornered...")
                if c == 2:
                    print("Rotating back side in Z direction...")
                    self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                    self.handle_front_facers([2, 0, 0], color)
                else:
                    pass

    def handle_corner_pieces(self, color):
        piece = self.collect_pieces3(color)
        if len(piece) == 0:
            print("No corner pieces...")
            return
        print(f"Corner piece: {piece}")
        dim, r, c = piece
        if dim == 1 or dim == 3:
            self.handle_top_facers(piece, color)
        else:
            self.handle_front_facers(piece, color)

    def running_template(self, color):
        while self.solve_level_one(color) == 0:
            self.solve_level_one(color)

        while self.bring_edge_pieces_to_bottom(color) == 0:
            self.bring_edge_pieces_to_bottom(color)

        # self.handle_corner_pieces(color)
        # self.handle_corner_pieces(color)

    def collect_pieces4(self):
        for _ in range(len(self.scrambled_cube)):
            if _ == 1 or _ == 3:
                continue
            if _ == 0:
                if (
                    self.scrambled_cube[0][2][1] != self.scrambled_cube[1][1][1]
                    and self.scrambled_cube[1][0][1] != self.scrambled_cube[1][1][1]
                ):
                    return [_, 2, 1]
            else:
                if self.scrambled_cube[_][0][1] != self.scrambled_cube[1][1][1]:
                    if _ == 4:
                        if self.scrambled_cube[1][1][0] != self.scrambled_cube[1][1][1]:
                            return [_, 0, 1]
                    elif _ == 5:
                        if self.scrambled_cube[1][1][2] != self.scrambled_cube[1][1][1]:
                            return [_, 0, 1]
                    elif _ == 2:
                        if self.scrambled_cube[1][2][1] != self.scrambled_cube[1][1][1]:
                            return [_, 0, 1]
        return []

    def handle_layer2_middle_pieces(self, front_color, top_color, piece):
        dim, r, c = piece
        if dim == 0:
            print("I am at back broo...")
            if self.scrambled_cube[4][1][1] == top_color:
                print("Move from back to right...")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
            else:
                print("Move fron back to left...")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
        elif dim == 2:
            print("I am at front bro...")
        elif dim == 4:
            print("I am at left bro...")
            if self.scrambled_cube[0][1][1] == top_color:
                print("Move to front....")
            else:
                print("Move to back....")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)

        elif dim == 5:
            print("I am at right bro...")
            if self.scrambled_cube[2][1][1] == top_color:
                print("Move right to back")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
            else:
                print("Move right to front")
        else:
            print("Invalid...")

    def layer2_helper(self, piece):
        dim, r, c = piece
        front_color = self.scrambled_cube[dim][r][c]
        if dim == 2:
            r_, c_ = 2, 1
        elif dim == 4:
            r_, c_ = 1, 0
        elif dim == 5:
            r_, c_ = 1, 0
        elif dim == 0:
            r_, c_ = 0, 1

        top_color = self.scrambled_cube[1][r_][c_]

        print(f"Top color: {top_color}")
        print(f"Front color: {front_color}")
        if self.scrambled_cube[dim][1][1] == front_color:
            print("Already matched...")
            self.handle_layer2_middle_pieces(front_color, top_color, piece)
            return
        if self.scrambled_cube[4][1][1] == front_color:
            print("I am at left: center...")
            # self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
            if dim == 0:
                print("I am at back...")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.handle_layer2_middle_pieces(front_color, top_color, [4, 0, 1])
                return
            elif dim == 2:
                print("I am at front...")
            elif dim == 5:
                print("I am at right")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.handle_layer2_middle_pieces(front_color, top_color, [4, 0, 1])

        elif self.scrambled_cube[5][1][1] == front_color:
            print("I am at right: center....")
            if dim == 0:
                print("Moving from back to right...")
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.handle_layer2_middle_pieces(front_color, top_color, [5, 0, 1])
            elif dim == 4:
                pass
            elif dim == 2:
                pass
        elif self.scrambled_cube[0][1][1] == front_color:
            print("I am at back: center....")
            if dim == 2:
                print(" moving from front to back...")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.handle_layer2_middle_pieces(front_color, top_color, [0, 2, 1])
                return
            elif dim == 4:
                print("moving from left to back...")
            elif dim == 5:
                print("moving from right to back...")

        else:
            print("Invalid...")

    def hande_layer2(self, color):
        piece = self.collect_pieces4()
        print(f"Layer 2: {piece}")
        self.layer2_helper(piece)

    def is_two_colors_matching(self):
        dims = []
        is_matching = False
        if (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
        ):
            is_matching = True
            dims.extend([2, 4])
        elif (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([2, 5])
        elif (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
        ):
            is_matching = True
            dims.extend([2, 0])
        elif (
            self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
            and self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
        ):
            is_matching = True
            dims.extend([4, 0])
        elif (
            self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([4, 5])
        elif (
            self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([0, 5])
        return [is_matching, dims]

    def check_is_top_complete(self):
        top = self.scrambled_cube[1]
        if top[0][0] != top[1][1]:
            return [0, 0]
        elif top[0][2] != top[1][1]:
            return [0, 2]
        elif top[2][0] != top[1][1]:
            return [2, 0]
        elif top[2][2] != top[1][1]:
            return [2, 2]
        return []

    def handle_twisted_pieces(self):
        tpiece1 = [
            self.scrambled_cube[1][0][0],
            self.scrambled_cube[4][0][0],
            self.scrambled_cube[0][2][0],
        ]
        c_colors1 = [
            self.scrambled_cube[1][1][1],
            self.scrambled_cube[4][1][1],
            self.scrambled_cube[0][1][1],
        ]
        tpiece2 = [
            self.scrambled_cube[1][0][2],
            self.scrambled_cube[5][0][2],
            self.scrambled_cube[0][2][2],
        ]
        c_colors2 = [
            self.scrambled_cube[1][1][1],
            self.scrambled_cube[5][1][1],
            self.scrambled_cube[0][1][1],
        ]
        tpiece3 = [
            self.scrambled_cube[1][2][0],
            self.scrambled_cube[4][0][2],
            self.scrambled_cube[2][0][0],
        ]
        c_colors3 = [
            self.scrambled_cube[1][1][1],
            self.scrambled_cube[4][1][1],
            self.scrambled_cube[2][1][1],
        ]
        tpiece4 = [
            self.scrambled_cube[1][2][2],
            self.scrambled_cube[2][0][2],
            self.scrambled_cube[5][0][0],
        ]
        c_colors4 = [
            self.scrambled_cube[1][1][1],
            self.scrambled_cube[2][1][1],
            self.scrambled_cube[5][1][1],
        ]

        tpiece1.sort()
        tpiece2.sort()
        tpiece3.sort()
        tpiece4.sort()
        c_colors1.sort()
        c_colors2.sort()
        c_colors3.sort()
        c_colors4.sort()
        print(f"T1pieces: {tpiece1} and C1_colors: {c_colors1}")
        print(f"T1pieces: {tpiece2} and C1_colors: {c_colors2}")
        print(f"T1pieces: {tpiece3} and C1_colors: {c_colors3}")
        print(f"T1pieces: {tpiece4} and C1_colors: {c_colors4}")

        if (
            tpiece1 == c_colors1
            and tpiece2 == c_colors2
            and tpiece3 == c_colors3
            and tpiece4 == c_colors4
        ):
            print("All are perfect....")
            k = self.check_is_top_complete()
            if len(k) == 0:
                print("Go duck yourself....")
                return
            if k[0] == 0 and k[1] == 0:
                print("Bringing left top cornered to bottom right cornered")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                while self.scrambled_cube[1][2][2] != self.scrambled_cube[1][1][1]:
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                while self.scrambled_cube[1][2][2] != self.scrambled_cube[1][1][1]:
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                while self.scrambled_cube[1][2][2] != self.scrambled_cube[1][1][1]:
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                while self.scrambled_cube[1][2][2] != self.scrambled_cube[1][1][1]:
                    self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, -1, 2)
                    self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 2)
                while self.scrambled_cube[2][1][1] != self.scrambled_cube[2][0][1]:
                    self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                print("Go SYD now...")
                return
            elif k[0] == 0 and k[1] == 2:
                print("Bringing top right cornered to bottom right cornered")
                return
            elif k[0] == 2 and k[1] == 0:
                print("Bringing left bottom cornered to bottom right cornered")
                return
            else:
                print("Eat 5-star do nothing!!")
                return

        if tpiece1 == c_colors1:
            print("Applying algorithm on top left cornered")
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            self.handle_twisted_pieces()
            return
        if tpiece2 == c_colors2:
            print("Applying algorithm on top right cornered")
            return
        if tpiece3 == c_colors3:
            print("Applying algorithm on bottom left cornered")
            return
        if tpiece4 == c_colors4:
            print("Applying algorithm on bottom right cornered")
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
            return
        print("No one matched.. apply on anyone")

    def handle_plus_on_top(self, color):
        print("Let's handle plus on top...")
        is_matching = False
        dims = []
        if (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
            and self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            print("Hurray!!, we did it...")
            self.handle_twisted_pieces()
            return
        if (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
        ):
            is_matching = True
            dims.extend([2, 4])
            print("Front and Left")
            # self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
            # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            # self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
            # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            # self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            return
        elif (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([2, 5])
            print("Front and right")
            return
        elif (
            self.scrambled_cube[2][0][1] == self.scrambled_cube[2][1][1]
            and self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
        ):
            is_matching = True
            dims.extend([2, 0])
            print("Front and back")
            return
        elif (
            self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
            and self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
        ):
            is_matching = True
            dims.extend([4, 0])
            print("Left and back")
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 0)
            while not self.is_two_colors_matching()[0]:
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.handle_plus_on_top(color)
            return
        elif (
            self.scrambled_cube[4][0][1] == self.scrambled_cube[4][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([4, 5])
            print("Left and right")
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
            while not self.is_two_colors_matching()[0]:
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.handle_plus_on_top(color)

            return
        elif (
            self.scrambled_cube[0][2][1] == self.scrambled_cube[0][1][1]
            and self.scrambled_cube[5][0][1] == self.scrambled_cube[5][1][1]
        ):
            is_matching = True
            dims.extend([0, 5])
            print("back and right")
            return
        if is_matching:
            print("I am matching in two sides")
            print(f"Dimensions: {dims}")
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
            while not self.is_two_colors_matching()[0]:
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)

            materials = self.is_two_colors_matching()[1]
            print(f"Here are matching colors...{materials}")
            self.handle_plus_on_top(color)

        else:
            print("I am not matching, unfortunately....")
            self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
            self.handle_plus_on_top(color)

    def handle_top_layer_figures(self, color):
        print("Checking for a plus on top....")
        top_mat = self.scrambled_cube[1]
        top_color = self.scrambled_cube[1][1][1]
        if (
            top_mat[0][1] == top_color
            and top_mat[1][0] == top_color
            and top_mat[1][2] == top_color
            and top_mat[2][1]
        ):
            print("Hello buddy i am your plus....")
            self.handle_plus_on_top(color)
            return
        elif (top_mat[1][0] == top_color and top_mat[1][2] == top_color) or (
            top_mat[0][1] == top_color and top_mat[2][1] == top_color
        ):
            print("Hello buddy i am your line...")
            if top_mat[1][0] == top_color and top_mat[1][2] == top_color:
                print("I am horizontal line...")
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.handle_top_layer_figures(color)
            else:
                print("I am vertical line...")
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.handle_top_layer_figures(color)

        else:
            if top_mat[0][1] == top_color and top_mat[1][0] == top_color:
                print("I am L in upside left...")
            elif top_mat[0][1] == top_color and top_mat[1][2] == top_color:
                print("I am L in upside right...")
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 0)
                self.handle_top_layer_figures(color)
            elif top_mat[2][1] == top_color and top_mat[1][0] == top_color:
                print("I am L in downside left...")
            elif top_mat[2][1] == top_color and top_mat[1][2] == top_color:
                print("I am L in downside right...")
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_X(self.scrambled_cube, 1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, -1, 0)
                self.cube_helper.rotate_X(self.scrambled_cube, -1, 2)
                self.cube_helper.rotate_Y(self.scrambled_cube, 1, 0)
                self.cube_helper.rotate_Z(self.scrambled_cube, -1, 2)
                self.handle_top_layer_figures(color)


cube = Cube(2)
print("Original\n\n")
# cube.show_cube()
# print("After one move\n\n")
# cube.solve_level_one("Yellow")
# cube.show_cube()
# print("\n\nAfter two move \n\n")
# cube.solve_level_one("Yellow")
# cube.show_cube()
# print("\n\nAfter 3rd move \n\n")
# cube.solve_level_one("Yellow")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# print("One edge piece is now at correct position")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# print("Secoond edge is now at its correct position")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.show_cube()
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.running_template("Yellow")
# cube.show_cube()
# cube.running_template("Yellow")
# cube.show_cube()
# cube.solve_level_one("Yellow")
# cube.solve_level_one("Yellow")
# cube.solve_level_one("Yellow")
# cube.solve_level_one("Yellow")

# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.bring_edge_pieces_to_bottom("Yellow")
# cube.cube_helper.rotate_Z(cube.scrambled_cube, 1, 0)
# cube.cube_helper.rotate_Z(cube.scrambled_cube, -1, 0)
# cube.cube_helper.rotate_Z(cube.scrambled_cube, 1, 2)
# cube.cube_helper.rotate_Z(cube.scrambled_cube, -1, 2)
# cube.handle_corner_pieces("Yellow")
# cube.handle_corner_pieces("Yellow")
# cube.handle_corner_pieces("Yellow")
# cube.handle_corner_pieces("Yellow")
# cube.handle_corner_pieces("Yellow")
# cube.hande_layer2("Yellow")
# cube.hande_layer2("Yellow")
# cube.hande_layer2("Yellow")
# cube.hande_layer2("Yellow")
cube.handle_top_layer_figures("Yellow")
# cube.handle_top_layer_figures("Yellow")
cube.show_cube()
