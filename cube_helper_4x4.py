class Helper4x4:
    def __init__(self) -> None:
        self.faces_indices = {
            "Back": 0,
            "Top": 1,
            "Front": 2,
            "Bottom": 3,
            "Left": 4,
            "Right": 5
        }

        self.indices_face = {
            0: "Back",
            1: "Top",
            2: "Front",
            3: "Bottom",
            4: "Left",
            5: "Right"
        }

        self.colors_indices = {
            "White": 1,
            "Blue": 2,
            "Yellow": 3,
            "Green": 4,
            "Red": 5,
            "Orange": 6
        }

        self.opposite_color = {
            "White": "Yellow",
            "Yellow": "White",
            "Blue": "Green",
            "Green": "Blue",
            "Red": "Orange",
            "Orange": "Red"
        }

        self.fixed_color_positions = {
            1: 1,
            3: 3,
            4: 5,
            6: 2,
            2: 4,
            5: 0

        }

        self.dx = [1, -1, 0, 0, 1, 1, -1, -1]
        self.dy = [0, 0, 1, -1, 1, -1, 1, -1]

        self.directions = {
            (1, 0): "Down",
            (-1, 0): "Up",
            (0, 1): "Right",
            (0, -1): "Left",
            (1, 1): "Right Down",
            (1, -1): "Left Down",
            (-1, 1): "Right Up",
            (-1, -1): "Left Up"
        }
        self.n = 4
    
    def rotate_face(self, face, direction):
        if direction == 1:
            # rotating given face in clockwise direction
            temp = face[0].copy()

            start_row, start_col = 0, 0
            end_row, end_col = self.n-1, self.n-1

            for i in range(end_row, start_row-1, -1):
                # rotating left strip -> top layer
                face[0][self.n - 1 - i] = face[i][0]
            start_col += 1

            for i in range(end_col, start_col-1, -1):
                # rotating bottom layer to left layer
                face[i][0] = face[self.n - 1][i]

            end_row -= 1

            for i in range(start_row+1, end_row+1):
                # rotating right layer to bottom
                face[self.n-1][self.n-1-i] = face[i][self.n-1]

            end_col -= 1

            for i in range(self.n):
                # rotating top layer to right layer
                face[i][self.n-1] = temp[i]

            # rotating middle square
            temp = face[1][1]
            face[1][1] = face[2][1]
            face[2][1] = face[2][2]
            face[2][2] = face[1][2]
            face[1][2] = temp


        else:
            # rotating given face in anti clockwise direction
            temp = face[0].copy()

            start_row, start_col = 0, 0
            end_row, end_col = self.n, self.n

            # bringing right layer to top
            for i in range(start_row, end_row):
                face[0][i] = face[i][self.n-1]
            
            end_col -= 1

            # bringing bottom layer to right
            for i in range(start_col, end_col):
                face[self.n-1-i][self.n-1] = face[self.n-1][i]

            end_row -= 1

            # bringing left layer to bottom
            for i in range(start_row, end_row):
                face[self.n-1][i] = face[i][0]
            
            start_col += 1
            
            # rotating top face to left
            for i in range(self.n):
                face[self.n-1-i][0] = temp[i]

            # rotating middle square
            temp = face[1][1]
            face[1][1] = face[1][2]
            face[1][2] = face[2][2]
            face[2][2] = face[2][1]
            face[2][1] = temp


     
    def rotate_outer_sides(self, cube, side, direction):
        if direction == 1:
            # rotating side clockwise
            match side:
                case "R" | "L" | "Right" | "Left":
                    col_idx = self.n-1 if side == "R" or side.title() == "Right" else 0
                    top = []
                    top_index = self.faces_indices["Top"]
                    front_index = self.faces_indices["Front"]
                    back_index = self.faces_indices["Back"]
                    bottom_index = self.faces_indices["Bottom"]

                    for _ in range(self.n):
                        top.append(cube[top_index][_][col_idx])

                    for _ in range(self.n):
                        cube[top_index][_][col_idx] = cube[front_index][_][col_idx]

                    for _ in range(self.n):
                        cube[front_index][_][col_idx] = cube[bottom_index][_][col_idx]

                    for _ in range(self.n):
                        cube[bottom_index][_][col_idx] = cube[back_index][_][col_idx]

                    for _ in range(self.n):
                        cube[back_index][_][col_idx] = top[_]
                    return

                case "T" | "Bo" | "Top" | "Bottom":
                    row_index = 0 if side == 'T' or side.title() == "Top" else self.n-1
                    back_face_index = 0 if row_index == self.n-1 else self.n-1

                    front_index = self.faces_indices["Front"]
                    right_index = self.faces_indices["Right"]
                    left_index = self.faces_indices["Left"]
                    back_index = self.faces_indices["Back"]
                    
                    temp_front_row = cube[front_index][row_index]
                    cube[front_index][row_index] = cube[right_index][row_index]
                    cube[right_index][row_index] = cube[back_index][back_face_index]
                    cube[back_index][back_face_index] = list(reversed(cube[left_index][row_index]))
                    cube[left_index][row_index] = temp_front_row

                    return

                case "F" | "Ba" | "Front" | "Back":
                    top_face_index = self.faces_indices["Top"]
                    right_face_index = self.faces_indices["Right"]
                    left_face_index = self.faces_indices["Left"]
                    bottom_face_index = self.faces_indices["Bottom"]
                    top_row_index = self.n - 1 if side == "F" or side.title() == "Front" else 0
                    right_col_index = 0 if side == "F" or side.title() == "Front" else self.n-1
                    bottom_row_index = 0 if side == "F" or side.title() == "Front" else self.n-1
                    left_col_index = self.n-1 if side == "F" or side.title() == "Front" else 0

                    top_row = []
                    # collecting top row colors
                    for color in cube[top_face_index][top_row_index]:
                        top_row.append(color)

                    # rotating left to top face
                    for index in range(self.n):
                        cube[top_face_index][top_row_index][self.n-1-index] = cube[left_face_index][index][left_col_index]

                      
                    # rotating bottom to left face
                    for index in range(self.n):
                        cube[left_face_index][index][left_col_index] = cube[bottom_face_index][bottom_row_index][index]

                    index = 0                    
                    # rotating right to bottom face
                    for index in range(self.n):
                        cube[bottom_face_index][bottom_row_index][self.n-1-index] = cube[right_face_index][index][right_col_index]

                    # rotating top piece to right
                    for index in range(self.n):
                        cube[right_face_index][index][right_col_index] = top_row[index]
                    return
                     
        else:
            # rotating side anti clockwise
            match side:
                case "R" | "L" | "Right" | "Left":
                    col_idx = self.n-1 if side == "R" or side.title() == "Right" else 0

                    top_face_idx = self.faces_indices["Top"]
                    front_face_idx = self.faces_indices["Front"]
                    bottom_face_idx = self.faces_indices["Bottom"]
                    back_face_idx = self.faces_indices["Back"]
                    
                    top_col = []

                    # collecting top layer pieces
                    for _ in range(self.n):
                        top_col.append(cube[top_face_idx][_][col_idx])

                    # bringing back layer to top
                    for _ in range(self.n):
                        cube[top_face_idx][_][col_idx] = cube[back_face_idx][_][col_idx]

                    # bringing bottom layer to back
                    for _ in range(self.n):
                        cube[back_face_idx][_][col_idx] = cube[bottom_face_idx][_][col_idx]

                    # bringing front layer to bottom
                    for _ in range(self.n):
                        cube[bottom_face_idx][_][col_idx] = cube[front_face_idx][_][col_idx]

                    # bringing top layer to front
                    for _ in range(self.n):
                        cube[front_face_idx][_][col_idx] = top_col[_]

                    return

                case "T" | "Bo" | "Top" | "Bottom":
                    row_idx = 0 if side == "T" or side.title() == "Top" else self.n-1
                    back_row_idx = 0 if row_idx == self.n-1 else self.n-1

                    front_face_idx = self.faces_indices["Front"]
                    left_face_idx = self.faces_indices["Left"]
                    back_face_idx = self.faces_indices["Back"]
                    right_face_idx = self.faces_indices["Right"]

                    front_rows = []
                    for _ in range(self.n):
                        front_rows.append(cube[front_face_idx][row_idx][_])

                    # bringing left faces to front
                    for _ in range(self.n):
                        cube[front_face_idx][row_idx][_] = cube[left_face_idx][row_idx][_]
                    
                    # bringing back faces to left
                    for _ in range(self.n):
                        cube[left_face_idx][row_idx][_] = cube[back_face_idx][back_row_idx][self.n-1-_]

                    # bringing right faces to back
                    for _ in range(self.n):
                        cube[back_face_idx][back_row_idx][_] = cube[right_face_idx][row_idx][self.n-1-_]

                    # bringing front faces to right
                    for _ in range(self.n):
                        cube[right_face_idx][row_idx][_] = front_rows[_]

                    return

                case "F" | "Ba" | "Front" | "Back":
                    top_row_idx = self.n-1 if side == "F" or side.title() == "Front" else 0
                    right_col_idx = 0 if side == "F" or side.title() == "Front" else self.n-1
                    bottom_row_idx = 0 if side == "F" or side.title() == "Front" else self.n-1
                    left_col_idx = self.n-1 if side == "F" or side.title() == " Front" else 0

                    top_face_idx = self.faces_indices["Top"]
                    right_face_idx = self.faces_indices["Right"]
                    bottom_face_idx = self.faces_indices["Bottom"]
                    left_face_idx = self.faces_indices["Left"]

                    top_rows = []
                    for _ in range(self.n):
                        top_rows.append(cube[top_face_idx][top_row_idx][_])

                    # bringing right to top
                    for _ in range(self.n):
                        cube[top_face_idx][top_row_idx][_] = cube[right_face_idx][_][right_col_idx]

                    # bringing bottom to right
                    for _ in range(self.n):
                        cube[right_face_idx][_][right_col_idx] = cube[bottom_face_idx][_][bottom_row_idx]

                    # bringing left to bottom
                    for _ in range(self.n):
                        cube[bottom_face_idx][bottom_row_idx][_] = cube[left_face_idx][_][left_col_idx]
                    
                    # bringing top to left
                    for _ in range(self.n):
                        cube[left_face_idx][_][left_col_idx] = top_rows[_]
                    
                    return

    

    def rotate_inner_sides(self, cube, side, direction):
        if direction == 1:
            # rotating side clockwise
            match side:
                case "R" | "L" | "Right" | "Left":
                    col_idx = self.n-2 if side == "R" or side == "Right" else 1
                    top = []
                    top_index = self.faces_indices["Top"]
                    front_index = self.faces_indices["Front"]
                    back_index = self.faces_indices["Back"]
                    bottom_index = self.faces_indices["Bottom"]

                    for _ in range(self.n):
                        top.append(cube[top_index][_][col_idx])

                    for _ in range(self.n):
                        cube[top_index][_][col_idx] = cube[front_index][_][col_idx]

                    for _ in range(self.n):
                        cube[front_index][_][col_idx] = cube[bottom_index][_][col_idx]

                    for _ in range(self.n):
                        cube[bottom_index][_][col_idx] = cube[back_index][_][col_idx]

                    for _ in range(self.n):
                        cube[back_index][_][col_idx] = top[_]
                    return

                case "T" | "Bo" | "Top" | "Bottom":
                    row_index = 1 if side == 'T' or side == "Top" else self.n-2
                    back_face_index = 1 if row_index == self.n-2 else self.n-2

                    front_index = self.faces_indices["Front"]
                    right_index = self.faces_indices["Right"]
                    left_index = self.faces_indices["Left"]
                    back_index = self.faces_indices["Back"]
                    
                    temp_front_row = cube[front_index][row_index]
                    cube[front_index][row_index] = cube[right_index][row_index]
                    cube[right_index][row_index] = cube[back_index][back_face_index]
                    cube[back_index][back_face_index] = list(reversed(cube[left_index][row_index]))
                    cube[left_index][row_index] = temp_front_row

                    return

                case "F" | "Ba" | "Front" | "Back":
                    top_face_index = self.faces_indices["Top"]
                    right_face_index = self.faces_indices["Right"]
                    left_face_index = self.faces_indices["Left"]
                    bottom_face_index = self.faces_indices["Bottom"]
                    top_row_index = self.n - 2 if side == "F" or side == "Front" else 1
                    right_col_index = 1 if side == "F" or side == "Front" else self.n-2
                    bottom_row_index = 1 if side == "F" or side == "Front" else self.n-2
                    left_col_index = self.n-2 if side == "F" or side == "Front" else 1

                    top_row = []
                    # collecting top row colors
                    for color in cube[top_face_index][top_row_index]:
                        top_row.append(color)

                    # rotating left to top face
                    for index in range(self.n):
                        cube[top_face_index][top_row_index][self.n-1-index] = cube[left_face_index][index][left_col_index]

                      
                    # rotating bottom to left face
                    for index in range(self.n):
                        cube[left_face_index][index][left_col_index] = cube[bottom_face_index][bottom_row_index][index]

                    index = 0                    
                    # rotating right to bottom face
                    for index in range(self.n):
                        cube[bottom_face_index][bottom_row_index][self.n-1-index] = cube[right_face_index][index][right_col_index]

                    # rotating top piece to right
                    for index in range(self.n):
                        cube[right_face_index][index][right_col_index] = top_row[index]
                    return
                     
        else:
            # rotating side anti clockwise
            match side:
                case "R" | "L" | "Right" | "Left":
                    col_idx = self.n-2 if side == "R" or side.title() == "Right" else 1

                    top_face_idx = self.faces_indices["Top"]
                    front_face_idx = self.faces_indices["Front"]
                    bottom_face_idx = self.faces_indices["Bottom"]
                    back_face_idx = self.faces_indices["Back"]
                    
                    top_col = []

                    # collecting top layer pieces
                    for _ in range(self.n):
                        top_col.append(cube[top_face_idx][_][col_idx])

                    # bringing back layer to top
                    for _ in range(self.n):
                        cube[top_face_idx][_][col_idx] = cube[back_face_idx][_][col_idx]

                    # bringing bottom layer to back
                    for _ in range(self.n):
                        cube[back_face_idx][_][col_idx] = cube[bottom_face_idx][_][col_idx]

                    # bringing front layer to bottom
                    for _ in range(self.n):
                        cube[bottom_face_idx][_][col_idx] = cube[front_face_idx][_][col_idx]

                    # bringing top layer to front
                    for _ in range(self.n):
                        cube[front_face_idx][_][col_idx] = top_col[_]

                    return

                case "T" | "Bo" | "Top" | "Bottom":
                    row_idx = 1 if side == "T" or side.title() == "Top" else self.n-2
                    back_row_idx = 1 if row_idx == self.n-2 else self.n-2

                    front_face_idx = self.faces_indices["Front"]
                    left_face_idx = self.faces_indices["Left"]
                    back_face_idx = self.faces_indices["Back"]
                    right_face_idx = self.faces_indices["Right"]

                    front_rows = []
                    for _ in range(self.n):
                        front_rows.append(cube[front_face_idx][row_idx][_])

                    # bringing left faces to front
                    for _ in range(self.n):
                        cube[front_face_idx][row_idx][_] = cube[left_face_idx][row_idx][_]
                    
                    # bringing back faces to left
                    for _ in range(self.n):
                        cube[left_face_idx][row_idx][_] = cube[back_face_idx][back_row_idx][self.n-1-_]

                    # bringing right faces to back
                    for _ in range(self.n):
                        cube[back_face_idx][back_row_idx][_] = cube[right_face_idx][row_idx][self.n-1-_]

                    # bringing front faces to right
                    for _ in range(self.n):
                        cube[right_face_idx][row_idx][_] = front_rows[_]

                    return

                case "F" | "Ba" | "Front" | "Back":
                    top_row_idx = self.n-2 if side == "F" or side.title() == "Front" else 1
                    right_col_idx = 1 if side == "F" or side.title() == "Front" else self.n-2
                    bottom_row_idx = 1 if side == "F" or side.title() == "Front" else self.n-2
                    left_col_idx = self.n-2 if side == "F" or side.title() == " Front" else 1

                    top_face_idx = self.faces_indices["Top"]
                    right_face_idx = self.faces_indices["Right"]
                    bottom_face_idx = self.faces_indices["Bottom"]
                    left_face_idx = self.faces_indices["Left"]

                    top_rows = []
                    for _ in range(self.n):
                        top_rows.append(cube[top_face_idx][top_row_idx][_])

                    # bringing right to top
                    for _ in range(self.n):
                        cube[top_face_idx][top_row_idx][_] = cube[right_face_idx][_][right_col_idx]

                    # bringing bottom to right
                    for _ in range(self.n):
                        cube[right_face_idx][_][right_col_idx] = cube[bottom_face_idx][_][bottom_row_idx]

                    # bringing left to bottom
                    for _ in range(self.n):
                        cube[bottom_face_idx][bottom_row_idx][_] = cube[left_face_idx][_][left_col_idx]
                    
                    # bringing top to left
                    for _ in range(self.n):
                        cube[left_face_idx][_][left_col_idx] = top_rows[self.n-1-_]
                    
                    return


    
    def rotate_x(self, cube, side, direction):
        if side == 'R' or side.title() == "Right":
            # rotating right face
            """
            faces used in this rotation are:
                1. right
                2. front face last col
                3. top face last col
                4. back face last col
                5. bottom face last col 
            """
            right_face_index = self.faces_indices["Right"]
            right_face = cube[right_face_index]
            self.rotate_face(face=right_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)
        elif side == 'L' or side.title() == "Left":
            # rotating left face
            """
            faces used in this rotation are:
                1. left
                2. front face first col
                3. top face first col
                4. back face first col
                5. bottom face first col
            """

            left_face_index = self.faces_indices["Left"]
            left_face = cube[left_face_index]
            self.rotate_face(face=left_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)
        else:
            raise Exception(f"Side: {side} is invalid side for x rotation.\nChoose Right or Left")
        

    def rotate_y(self, cube, side, direction):
        if side == "T" or side.title() == "Top":
            # rotating top face
            """
            faces used in Top face rotation:
                1. top
                2. front first row
                3. left first row
                4. right first row
                5. back last row
            """

            top_face_index = self.faces_indices["Top"]
            top_face = cube[top_face_index]
            self.rotate_face(face=top_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)

        elif side == "Bo" or side.title() == "Bottom":
            # rotating bottom face
            """
            faces used in Bottom face rotation:
                1. bottom
                2. front last row
                3. left last row
                4. right last row
                5. back first row
            """
            bottom_face_index = self.faces_indices["Bottom"]
            bottom_face = cube[bottom_face_index]
            self.rotate_face(face=bottom_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)
        else:
            raise Exception(f"Side: {side} is invalid side for y rotation.\nChoose Top or Bottom")


    def rotate_z(self, cube, side, direction):
        if side == "F" or side.title() == "Front":
            """
            faces used in front rotation;
                1. front face
                2. top face last row
                3. right face first col
                4. left face last col
                5. bottom face first row
            """

            front_face_index = self.faces_indices["Front"]
            front_face = cube[front_face_index]
            self.rotate_face(face=front_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)
        
        elif side == "Ba" or side.title() == "Back":
            """
            faces used in back rotation:
                1. back face
                2. top face first row
                3. right face last col
                4. left face first col
                5. bottom face last row
            """

            back_face_index = self.faces_indices["Back"]
            back_face = cube[back_face_index]
            self.rotate_face(face=back_face, direction=direction)
            self.rotate_outer_sides(cube=cube, side=side, direction=direction)

        else:
            raise Exception(f"Side: {side} is an invalid side for z rotation.\nChoose Front or Back")


    def collect_centre_pieces(self, cube, color, skip_face):
        centre_pieces = []
        if color not in self.colors_indices:
            raise Exception(f"Color: {color} is an invalid color.\n Choose from Red, White, Yellow, Green, Blue, Orange.")
        color_index = self.colors_indices[color]
        
        for face_idx in range(len(cube)):
            if face_idx in skip_face:
                continue
            for row in range(1, 3):
                for col in range(1, 3):
                    if cube[face_idx][row][col] == color_index:
                        # centre_pieces.append((face_idx, row, col))
                        return (face_idx, row, col)
        
        return None
    

    def rotate_sides(self, cube, axis, side, no_of_rotations, direction, inner_outer):
        if inner_outer == "outer":
            if axis == "x":
                for _ in range(no_of_rotations):
                    self.rotate_x(cube=cube, side=side, direction=direction)

            elif axis == "y":
                for _ in range(no_of_rotations):
                    self.rotate_y(cube=cube, side=side, direction=direction)

            elif axis == "z":
                for _ in range(no_of_rotations):
                    self.rotate_z(cube=cube, side=side, direction=direction)

            else:
                raise Exception("Wrong axis.")

        else:
            if axis == "x":
                for _ in range(no_of_rotations):
                    self.rotate_inner_sides(cube=cube, side=side, direction=direction)

            elif axis == "y":
                for _ in range(no_of_rotations):
                    self.rotate_inner_sides(cube=cube, side=side, direction=direction)

            elif axis == "z":
                for _ in range(no_of_rotations):
                    self.rotate_inner_sides(cube=cube, side=side, direction=direction)

            else:
                raise Exception("Wrong axis, goddamit.")


    def give_me_rotation_and_axis(current_face: int, desired_face: int):
        # Map of rotations needed to get from current face to desired face
        rotations = {
            0: { # Back face
                1: ("x", 1),  # To top: rotate x once 
                2: ("x", 2),  # To front: rotate x twice
                3: ("x", 3),  # To bottom: rotate x three times
                4: ("y", 1),  # To left: rotate y once
                5: ("y", 3)   # To right: rotate y three times
            },
            1: { # Top face  
                0: ("x", 3),  # To back: rotate x three times
                2: ("x", 1),  # To front: rotate x once
                3: ("x", 2),  # To bottom: rotate x twice
                4: ("z", 1),  # To left: rotate z once
                5: ("z", 3)   # To right: rotate z three times
            },
            2: { # Front face
                0: ("x", 2),  # To back: rotate x twice
                1: ("x", 3),  # To top: rotate x three times
                3: ("x", 1),  # To bottom: rotate x once
                4: ("y", 3),  # To left: rotate y three times
                5: ("y", 1)   # To right: rotate y once
            },
            3: { # Bottom face
                0: ("x", 1),  # To back: rotate x once
                1: ("x", 2),  # To top: rotate x twice
                2: ("x", 3),  # To front: rotate x three times
                4: ("z", 3),  # To left: rotate z three times
                5: ("z", 1)   # To right: rotate z once
            },
            4: { # Left face
                0: ("y", 3),  # To back: rotate y three times
                1: ("z", 3),  # To top: rotate z three times
                2: ("y", 1),  # To front: rotate y once
                3: ("z", 1),  # To bottom: rotate z once
                5: ("y", 2)   # To right: rotate y twice
            },
            5: { # Right face
                0: ("y", 1),  # To back: rotate y once
                1: ("z", 1),  # To top: rotate z once
                2: ("y", 3),  # To front: rotate y three times
                3: ("z", 3),  # To bottom: rotate z three times
                4: ("y", 2)   # To left: rotate y twice
            }
        }

        # Return no rotation if same face
        if current_face == desired_face:
            return None, 0

        # Get rotation from mapping
        if current_face in rotations and desired_face in rotations[current_face]:
            return rotations[current_face][desired_face]
        
        raise Exception(f"Invalid face indices: current={current_face}, desired={desired_face}")


    def check_pieces_sideways(self, cube, face_index, row, col, color):
        """
        This function checks whether pieces are side to each other or not
        If they are diagonal to each other, then bring them sideways
        """
        print("Checking sideways....")

        # first check whether their exists a piece which is present at sideways
        if col == 1:
            # checking right side
            if cube[face_index][row][col+1] == color:
                print("Sideways present.")
                return
            if row == 1:
                # checking down side
                if cube[face_index][row+1][col] == color:
                    print("Downside present.")
                    return
            else:
                # checking upside
                if cube[face_index][row-1][col] == color:
                    print("Upside present.")
                    return
        else:
            # checking left side
            if cube[face_index][row][col-1] == color:
                print("Sideways present.")
                return
            
            if row == 1:
                # checking down side
                if cube[face_index][row+1][col] == color:
                    print("Downside present.")
                    return
            else:
                # checking upside
                if cube[face_index][row-1][col] == color:
                    print("Upside present.")
                    return
                


        dx = [1, 1, -1, -1]
        dy = [-1, 1, -1, 1]

        for _ in range(len(dx)):
            nrow = row + dx[_]
            ncol = col + dy[_]

            if 1<=nrow<=2 and 1<=ncol<=2 and cube[face_index][nrow][ncol] == color:
                side = "Right" if col == 2 else "Left"
                # rotate this side clockwise
                print(f"Got diagonal case! Rotating inner side: {side} to back.")
                self.rotate_inner_sides(cube=cube, side=side, direction=1)
                rotation_direction = 1 if row == 2 else -1
                print(f"Rotating back face,  {rotation_direction=}")
                self.rotate_z(cube=cube, side="Back", direction=rotation_direction)
                print("Bring that piece back.")
                self.rotate_inner_sides(cube=cube, side=side, direction=-1)



    def handle_Lcase_first_color(self, cube, pos: tuple, color: str):
        face, row, col = pos

        # finding the vacancy at top.
        top_index = self.faces_indices["Top"]
        top_face = cube[top_index]
        top_color = self.colors_indices[color]

        vac_row, vac_col = None, None
        # traversing in a square
        for i in range(1, 3):
            for j in range(1, 3):
                if top_face[i][j] != top_color:
                    vac_row, vac_col = i, j
                    break
            if vac_row is not None:
                break
        

        print(f"Vacant Row: {vac_row} and Vacant Col: {vac_col}")
        final_col = 1 if vac_col == 2 else 2

        # back face
        if face == 0:
            print("Hey!! I am present at Back.")

        # front
        elif face == 2:
            print("Hey!! I am present at Front.")

        # bottom
        elif face == 3:
            print("Hey!! I am present at Bottom.")

        # left
        elif face == 4:
            print("Hey!! I am present at Left.")
            if col == final_col:
                print("Already at right col. No need to move")
            
            else:
                print("Bringing it to right column")
                if row == 1:
                    self.rotate_x(cube=cube, side="Left", direction=-1)
                else:
                    self.rotate_x(cube=cube, side="Left", direction=-1)
                    self.rotate_x(cube=cube, side="Left", direction=-1)

            
            final_row = col
            inner_side_to_rotate = None
            if final_row == 1:
                print("Already at right row position. No need to move.")
            else:
                print("Rotating once in anti-clockwise left face to bring it at correct position.")
                self.rotate_x(cube=cube, side="Left", direction=-1)

            if vac_row == 1:
                    inner_side_to_rotate = "Back"
                    self.rotate_inner_sides(cube=cube, side=inner_side_to_rotate, direction=-1)
                    self.rotate_x(cube=cube, side="Left", direction=-1)
                    self.rotate_inner_sides(cube=cube, side="Back", direction=1)
            else:
                inner_side_to_rotate = "Front"

            # print(f"{inner_side_to_rotate=}")


        # right
        elif face == 5:
            print("Hey!! I am present at Right.")

        else:
            raise Exception(f"face {face} doesnot exist.")


    def make_center_pairs(self, cube, pos1, pos2):
        print("Starting to make center pairs....")
        print(f"{pos1=}")
        print(f"{pos2=}")
        face1, row1, col1 = pos1
        face2, row2, col2 = pos2

        if face1 == 0:
            print("Piece 1 is at back.")
            if face2 == 1:
                print("Piece 2 is at top.")
            elif face2 == 2:
                print("Piece 2 is at front.")
                if row1 == self.n-1-row2:
                    print("Already on same row.")
                    return
                else:
                    side = "Top" if row1 == 2 else "Bottom"
                    print("Rotating inner row.")
                    self.rotate_inner_sides(cube=cube, side=side, direction=1)
                    self.rotate_inner_sides(cube=cube, side=side, direction=1)
                    if col1 == col2:
                        print("Already on same col.")
                    else:
                        if col1 != col2:
                            self.rotate_z(cube=cube, side="Back", direction=1)
                    print("Done bringing to same loc.")
                    return face2, row2, col2
            elif face2 == 3:
                print("Piece 2 is at bottom.")
            elif face2 == 4:
                print("Piece 2 is at left.")
            elif face2 == 5:
                print("Piece 2 is at right.")
        elif face1 == 1:
            print("Piece 1 is at top.")
            if face2 == 0:
                print("Piece 2 is at back.")
            elif face2 == 2:
                print("Piece 2 is at front.")
            elif face2 == 3:
                print("Piece 2 is at bottom.")
            elif face2 == 4:
                print("Piece 2 is at left.")
            elif face2 == 5:
                print("Piece 2 is at right.")

        elif face1 == 2:
            print("Piece 1 is at front.")
            if face2 == 0:
                print("Piece 2 is at back.")
            elif face2 == 1:
                print("Piece 2 is at top.")
            elif face2 == 3:
                print("Piece 2 is at bottom.")
            elif face2 == 4:
                print("Piece 2 is at left.")
                if row1 == row2:
                    if col1 == col2:
                        # move clockwise left face
                        self.rotate_x(cube=cube, side="Left", direction=1)
                        color_number = cube[face1][row1][col1]
                        # first checking at right face
                        check_empty_front = self.check_for_empty_space(cube=cube, face_index=5, row=row1, color_number=color_number)
                        if check_empty_front == 4:
                            print("All clear at right face")
                            # checking back face
                            check_empty_back = self.check_for_empty_space(cube=cube, row=abs(3-row1), face_index=0, color_number=color_number)
                            if check_empty_back == 4:
                                print("All clear at back as well")
                                self.rotate_inner_sides(cube=cube, side="Bottom", direction=-1)
                            elif check_empty_back == 3:
                                print("Colliding at col 2")
                            elif check_empty_back == 2:
                                print("Colliding at col 1")
                            else:
                                print("Colliding at same row")
                    else:
                        pass
                else:
                    if col1 == col2:
                        print("Rows are different and cols are same.")
                        color_number = cube[face1][row1][col1]
                        
                        face_index = self.fixed_color_positions[color_number]
                        check_empty_space = self.check_for_empty_space(cube=cube, row=row1, face_index=face_index, color_number=color_number)
                        print(f"{check_empty_space=}")
                        if check_empty_space == 4:
                            # all clear
                            self.rotate_inner_sides(cube=cube, side="Top", direction=1)
                        elif check_empty_space == 3:
                            # on col 2
                            pass
                        elif check_empty_space == 2:
                            # on col 1
                            pass
                        elif check_empty_space == 1:
                            # on same row
                            pass
                    else:
                        pass
            elif face2 == 5:
                print("Piece 2 is at right.")
        elif face1 == 3:
            print("Piece 1 is at bottom.")
            if face2 == 0:
                print("Piece 2 is at back.")
            elif face2 == 1:
                print("Piece 2 is at top.")
            elif face2 == 2:
                print("Piece 2 is at front.")
            elif face2 == 4:
                print("Piece 2 is at left.")
            elif face2 == 5:
                print("Piece 2 is at right.")
        elif face1 == 4:
            print("Piece 1 is at left.")
            if face2 == 0:
                print("Piece 2 is at back.")
            elif face2 == 1:
                print("Piece 2 is at top.")
            elif face2 == 2:
                print("Piece 2 is at front.")
            elif face2 == 3:
                print("Piece 2 is at bottom.")
            elif face2 == 5:
                print("Piece 2 is at right.")
        elif face1 == 5:
            print("Piece 1 is at right.")
            if face2 == 0:
                print("Piece 2 is at back.")
            elif face2 == 1:
                print("Piece 2 is at top.")
            elif face2 == 2:
                print("Piece 2 is at front.")
            elif face2 == 3:
                print("Piece 2 is at bottom.")
            elif face2 == 4:
                print("Piece 2 is at left.")
        else:
            raise Exception("Invalid face indices.")


    def make_second_center(self, cube, color: str, skip_face: list[int]=[3]):

        def count_pieces(face, color):
            count = 0
            for i in range(1, 3):
                for j in range(1, 3):
                    if face[i][j] == color:
                        count += 1
            return count


        color_number = self.colors_indices[color]
        # print(f"Making second color: {color}")

        all_pieces = self.collect_centre_pieces(cube=cube, color=color, skip_face=skip_face)
        print(all_pieces)

        if not all_pieces:
            print("Second center is finished....")
            return

        while all_pieces:
            piece = all_pieces
            face, row, col = piece
            location = None
            # back face
            if face == 0:
                print("I am at back.")
                print(f"{piece=}")
                # checking same color on sideways.
                for i in range(8):
                    nrow = row + self.dx[i]
                    ncol = col + self.dy[i]

                    if 1<=nrow<=2 and 1<=ncol<=2 and cube[face][nrow][ncol] == color_number:
                        location = (face, self.dx[i], self.dy[i])
                        break
                print(f"{location=}")
                # no pieces of same color presents around
                if location is None:
                    print("No one around me, I am alone.")
                    count_at_bottom = count_pieces(face=cube[3], color=color_number)
                    if count_at_bottom == 4:
                        print("Bottom is finished.")
                        return

                    if count_at_bottom == 3:
                        print("L shape case at bottom.")
                        self.handle_Lcase_second_color(cube=cube, pos=piece, color=color)
                        return
                    
                    print("Finding another piece to make pair.")
                    new_piece = self.collect_centre_pieces(cube=cube, color=color, skip_face=[face, 3])
                    final_face, final_row, final_col = self.make_center_pairs(cube=cube, pos1=piece, pos2=new_piece)
                    print(f"{final_face=} {final_row=} {final_col=}")
                    self.make_second_center(cube=cube, color=color)
                    return
                # if a piece is present in surrounding.
                else:
                    print("So there are pieces surrounding.")
                    print(f"{location=}")
                    direction = self.directions[(location[1], location[2])]
                    print(f"{direction=}")
                    match direction:
                        case "Right":
                            print("Making right line to vertical line.")
                            # making that line vertical
                            if row == 1:
                                self.rotate_z(cube=cube,side="Back", direction=1)
                            elif row == 2:
                                self.rotate_z(cube=cube, side="Back", direction=-1)
                            # brought it to bottom
                            self.rotate_inner_sides(cube=cube, side="Right", direction=1)

                            # now save it and revert back white center
                            self.rotate_y(cube=cube, side="Bottom", direction=1)
                            self.rotate_y(cube=cube, side="Bottom", direction=1)

                            self.rotate_inner_sides(cube=cube, side="Right", direction=-1)
                        
                        case "Left":
                            print("Making left line vertical.")

                        case "Up":
                            print("I am already vertical.")

                        case "Down":
                            print("I am already vertical.")

                        case "Right Up":
                            print("I am already at right up.")
                        
                        case "Right Down":
                            print("I am already at right down.")

                        case "Left Up":
                            print("I am already at left up.")

                        case "Left Down":
                            print("I am already at left down.")

                

            # front face
            elif face == 2:
                print("I am at front.")
                for i in range(8):
                    nrow = row + self.dx[i]
                    ncol = col + self.dy[i]

                    if 1<=nrow<=2 and 1<=ncol<=2 and cube[face][nrow][ncol] == color_number:
                        location = (face, self.dx[i], self.dy[i])
                        break
                print(f"{location=}")
                if location is None:
                    print("No one arond me.")
                    return
                
                else:
                    print("I have a neighbour.")
                    direction = self.directions[(location[1], location[2])]
                    print(f"{direction=}")
                    
                    match direction:
                        case "Right":
                            print("I am alreadt at right")

                        case "Left":
                            print("I am already at left")

                        case "Up":
                            print("I am already at up")

                        case "Down":
                            print("I am already at down.")
                            # checking horizontal or vertical line in bottom face

                            # case 1: checking horizontal line on same col
                            if cube[3][1][col] == color_number and cube[3][2][col] == color_number:
                                print("I am vertical line on same col")
                                self.rotate_inner_sides(cube=cube, side="Left", direction=-1)
                                self.rotate_y(cube=cube, side="Bottom", direction=1)
                                self.rotate_y(cube=cube, side="Bottom", direction=1)
                                self.rotate_inner_sides(cube=cube, side="Left", direction=1)
                            # case 2: checking horizontal line on different col
                            elif cube[3][1][abs(3-col)] == color_number and cube[3][2][abs(3-col)] == color_number:
                                print("I am vertical line on diff col")
                            # case 3: checking vertical line on upper row
                            elif cube[3][1][1] == color_number and cube[3][1][2] == color_number:
                                print("I am horizontal line on upper row")
                            # case 4: checking vertical line on bottom row
                            elif cube[3][2][1] == color_number and cube[3][2][2] == color_number:
                                print("I am horizontal line on bottom row")


                        case "Right Up":
                            print("I am already at right up.")
                        
                        case "Right Down":
                            print("I am already at right down.")

                        case "Left Up":
                            print("I am already at left up.")

                        case "Left Down":
                            print("I am already at left down.") 

                    return

            # bottom face
            elif face == 3:
                print("I am at bottom.")
                return

            # left face
            elif face == 4:
                print("I am at left.")
                return

            # right face
            elif face == 5:
                print("I am at right.")
                return

            else:
                raise Exception("Invalid face...")
            
            all_pieces = self.collect_centre_pieces(cube=cube, color=color, skip_face=[3])
            

    def make_first_center(self, cube, color: str, face: str="Top"):

        def count_pieces(face, color):
            count = 0
            for i in range(1, 3):
                for j in range(1, 3):
                    if face[i][j] == color:
                        count += 1
            return count
        

        print(f"Making first color: {color}")
        color_number = self.colors_indices[color]
        # complete this color at top, i.e. at index 1
        top_index = self.faces_indices[face]
        count_of_white_pieces_at_top = count_pieces(face=cube[top_index], color=color_number)
        if count_of_white_pieces_at_top == 4:
            print("White centre finished.")
            return
        
        if count_of_white_pieces_at_top == 3:
            print("Handling L case at top.")
            # filtering only absent piece at top.
            all_pieces = [i for i in all_pieces if i[0] != top_index]
            self.handle_Lcase_first_color(cube=cube, pos=all_pieces, color=color)
            return
        

        all_pieces = self.collect_centre_pieces(cube=cube, color=color, skip_face=[1])
        while all_pieces:
            face, row, col = all_pieces
            count_of_white_pieces_at_top = count_pieces(face=cube[top_index], color=color_number)
            if count_of_white_pieces_at_top == 4:
                print("White centre finished.")
                break
            
            if count_of_white_pieces_at_top == 3:
                print("L shape case.")
                self.handle_Lcase_first_color(cube=cube, pos=(face, row, col), color=color)
                break
            
            if face == top_index:
                print("Hey!! I am at top.")
                # fixes if peices are diagonal
                self.check_pieces_sideways(cube=cube, face_index=face, row=row, col=col, color=color_number)

            else:
                # back face:
                if face == 0:
                    print("Hey! I am at back face, ready to come at top.")

                # front face
                elif face == 2:
                    print("Hey! I am at front face, ready to come at top.")
                    # checking whether same color peice is in same col, at it's top or not
                    if cube[top_index][1][col] == color_number:
                        print("Rotating top layer clockwise, to save same color pieces at the top.")
                        self.rotate_y(cube=cube, side="Top", direction=1)
                    elif cube[top_index][2][col] == color_number:
                        print("Rotating top layer to anti-clockwise, to save same color pieces at the top.")
                        self.rotate_y(cube=cube, side="Top", direction=-1)
                    
                    # finally bringing white piece to top from front.
                    side = "Right" if col == 2 else "Left"
                    print(f"Rotating inner side: {side}")
                    self.rotate_inner_sides(cube=cube, side=side, direction=1)

                    # checking whether we have sideways after merging or not?
                    self.check_pieces_sideways(cube=cube, face_index=top_index, row=row, col=col, color=color_number)

                # bottom face
                elif face == 3:
                    print("Hey! I am at bottom face, ready to come at top.")

                # left face
                elif face == 4:
                    print("Hey! I am at left face, ready to come at top.")
                    top_row = col
                    # if both pieces are on same col
                    if cube[top_index][top_row][1] == color_number and cube[top_index][top_row][2] == color_number:
                        print("Both pieces on same level, rotating top face 2x")
                        print(f"{count_of_white_pieces_at_top=}")
                        self.rotate_y(cube=cube, side="Top", direction=1)
                        self.rotate_y(cube=cube, side="Top", direction=1)
                        # bringing left side piece to top
                        self.rotate_inner_sides(cube=cube, side="Back", direction=1)
                    elif top_row == 1:
                        if cube[top_index][top_row][1] == color_number and cube[top_index][top_row+1][1] == color_number:
                            # rotating top face anti-clockwise to make space for left piece
                            print("There is vertical line in col 1.")
                            self.rotate_y(cube=cube, side="Top", direction=-1)
                            self.rotate_inner_sides(cube=cube, side="Back", direction=-1)
                        elif cube[top_index][top_row][2] == color_number and cube[top_index][top_row+1][2] == color_number:
                            print("There is vertical line in col 2.")
                            self.rotate_y(cube=cube, side="Top", direction=1)
                            self.rotate_inner_sides(cube=cube, side="Back", direction=-1)
                        else:
                            print("No need to adjust, already adjusted.")
                            self.rotate_inner_sides(cube=cube, side="Back", direction=-1)

                    elif top_row == 2:
                        if cube[top_index][top_row][1] == color_number and cube[top_index][top_row-1][1] == color_number:
                            # rotating top face clockwise to make space for left piece
                            print("There is vertical line on col 1.")
                            self.rotate_y(cube=cube, side="Top", direction=1)
                            self.rotate_inner_sides(cube=cube, side="Front", direction=1)
                        elif cube[top_index][top_row][2] == color_number and cube[top_index][top_row-1][2] == color_number:
                            print("There is a vertical line on col 2.")
                            self.rotate_y(cube=cube, side="Top", direction=-1)
                            self.rotate_inner_sides(cube=cube, side="Front", direction=1)
                        else:
                            print("Already adjusted, no need to adjust")
                            self.rotate_inner_sides(cube=cube, side="Front", direction=1)


                # right face
                elif face == 5:
                    print("Hey! I am at right face, ready to come at top.")
            
            all_pieces = self.collect_centre_pieces(cube=cube, color=color, skip_face=[1])

        opposite_color = self.opposite_color[color]
        print(f"Making second color: {opposite_color}")
        self.make_second_center(cube=cube, color=opposite_color)
        self.make_other_4_centers(cube=cube)

    

    def __count_pieces(self,face, color):
            count = 0
            color_number = self.colors_indices[color]
            print(f"{color_number=}")
            for i in range(1, 3):
                for j in range(1, 3):
                    if face[i][j] == color_number:
                        count += 1
            return count


    def handle_directions_of_pieces(self, cube, curr_pos, direction_of_neighbour):

        def handle_directions_helper(cube, face, direction):
            face_index, row, col = curr_pos
            match face:
                case "Front" | "Back":
                    print("I am rotating in z direction")
                    self.rotate_z(cube=cube, side=face, direction=direction)
                    return col
                case "Left" | "Right":
                    print("I am rotating in x direction")
                    self.rotate_x(cube=cube, side=face, direction=direction)
                    return 1 if col == 2 else 2
                case "Top" | "Bottom":
                    print("I am rotating in y direction")
                    self.rotate_y(cube=cube, side=face, direction=direction)
                    return 1 if col == 2 else 2

        face_index, row, col = curr_pos
        face = self.indices_face[face_index]

        match direction_of_neighbour:
            case "Right":
                print("I am at right")
                return row

            case "Left":
                print("I am at left")
                return row

            case "Up":
                print("I am at up")
                return handle_directions_helper(cube=cube, face=face, direction=1)

            case "Down":
                print("I am at down")
                return handle_directions_helper(cube=cube, face=face, direction=1)

            case "Right Up":
                print("I am at right up")

            case "Right Down":
                print("I am at right down")

            case "Left Up":
                print("I am at left up")

            case "Left Down":
                print("I am at left down")
    

    def check_for_empty_space(self, cube, row, face_index, color_number):
        """
        This function takes input as cube, pos (row, col), face_index (face where we need to check) and color_number
        Work everything in rows, if they paired in a col then bring it to row.

        return 1 if they are on same line { G G }
        return 2 if one the piece is present in col 1 
        G X
        G X

        return 3 if one the piece is present in col 2
        X G
        X G
        """
        # case 1: check horizontally
        if cube[face_index][row][1] == color_number and cube[face_index][row][2] == color_number:
            print("We are on same line")
            return 1
        
        if cube[face_index][row][1] == color_number:
            print("Piece are present in col 1")
            return 2
        
        if cube[face_index][row][2] == color_number:
            print("Piece are present in col 2")
            return 3
        
        else:
            print("Pieces are nowhere on the way")
            return 4
    
    
    def bring_center_pieces_to_correct_pos(self, cube, curr_pos, direction_of_neighbour):
        # bringing to face index 5 [ Right ]
        face_index = curr_pos[0]
        final_row = self.handle_directions_of_pieces(cube=cube, curr_pos=curr_pos, direction_of_neighbour=direction_of_neighbour)
        face_to_rotate = "Top" if final_row == 1 else "Bottom"
        color_number = self.colors_indices["Green"]
        if face_index == 0:
            # back face
            print("I am at back..")
            face_to_rotate = "Top" if face_to_rotate == "Bottom" else "Bottom"
            print(f"{face_to_rotate=}")
            # before rotating directly, i need to check whether it disturbs other fixed piece or not.
            check_empty = self.check_for_empty_space(cube=cube, face_index=5, row=abs(3-final_row),color_number=color_number)
            
            if check_empty == 1:
                # they are on same row
                print("They are on the same row")
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)
                self.rotate_x(cube=cube, side="Right", direction=1)
                self.rotate_x(cube=cube, side="Right", direction=1)
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=-1)
            elif check_empty == 2:
                # they are colliding on col 1
                print("They are colliding on col 1")
                self.rotate_y(cube=cube, side="Back", direction=-1)
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)
            elif check_empty == 3:
                # they are colliding on col 2
                print("They are colliding on col 1")
                self.rotate_y(cube=cube, side="Back", direction=1)
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)
            else:
                # all clear
                print("All clear")
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)


        elif face_index == 1:
            # top face
            print("I am at top..")
            return

        elif face_index == 2:
            # front face
            print("I am at front..")
            return

        elif face_index == 3:
            # bottom face
            print("I am at bottom..")
            return

        elif face_index == 4:
            # left face
            print("I am at left..")
            print(f"{face_to_rotate=}")
            check_empty = self.check_for_empty_space(cube=cube, face_index=5, row=final_row,color_number=color_number)
            print(f"{check_empty=}")
            if check_empty == 4:
                print("All clear")
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)
                self.rotate_inner_sides(cube=cube, side=face_to_rotate, direction=1)
            elif check_empty == 3:
                print("Colliding on col 2")

            elif check_empty == 2:
                print("Colliding on col 1")

            elif check_empty == 1:
                print("we are on the same row.")
                self.rotate_inner_sides(cube=cube,side=face_to_rotate, direction=1)
                self.rotate_inner_sides(cube=cube,side=face_to_rotate, direction=1)
                self.rotate_x(cube=cube, side="Right", direction=1)
                self.rotate_x(cube=cube, side="Right", direction=1)
                self.rotate_inner_sides(cube=cube,side=face_to_rotate, direction=-1)
                self.rotate_inner_sides(cube=cube,side=face_to_rotate, direction=-1)
                
            return

        elif face_index == 5:
            # right face
            print("I am at right..") 
            return

        else:
            raise Exception("Face index out of bound.")

    def make_third_color(self,cube, color, center_index):
        print("==================\nMaking third color Green")
        count_of_pieces_at_center = self.__count_pieces(face=cube[center_index], color=color)  # collecting center pieces of matching color on that face
        if count_of_pieces_at_center == 4:
            print("Third center is finished....")
            return
        
        if count_of_pieces_at_center == 3:
            print("Handling L shape")
            return
        

        color_number = self.colors_indices[color]
        print(f"{color_number=}")
        
        while True:
            count_of_pieces_at_center = self.__count_pieces(face=cube[center_index], color=color)
            print(f"{count_of_pieces_at_center=}")
            if count_of_pieces_at_center == 4:
                print("Third center is finished....")
                break

            if count_of_pieces_at_center == 3:
                print("Handling L shape inside while loop")
                break
            
            piece = self.collect_centre_pieces(cube=cube, color=color, skip_face=[center_index])
            print(f"{piece=}")
            face_index, row, col = piece


            surrounding_piece = None
            for i in range(8):
                nrow = row + self.dx[i]
                ncol = col + self.dy[i]

                if 1<=nrow<=2 and 1<=ncol<=2 and cube[face_index][nrow][ncol] == color_number:
                    surrounding_piece = (self.dx[i], self.dy[i])
                    break
            
            if surrounding_piece is None:
                # No surrounding piece, lone piece
                print("Lone warrier...")
                # finding another piece
                piece2 = self.collect_centre_pieces(cube=cube, color=color, skip_face=[center_index, face_index])
                print(f"{piece2=}")
                self.make_center_pairs(cube=cube, pos1=piece, pos2=piece2)
            else:
                # I have a neighbour
                print("I have a neighbour...")
                print(f"{surrounding_piece=}")

                placement_of_neighbour = self.directions[surrounding_piece]
                print(f"{placement_of_neighbour=}")

                self.bring_center_pieces_to_correct_pos(cube=cube, curr_pos=piece, direction_of_neighbour=placement_of_neighbour)

    
    
    def __check_adjacent_piece(self, piece, cube, color_number: int):
        print(f"{piece=}")
        face_index, row, col = piece


        surrounding_piece = None
        for i in range(8):
            nrow = row + self.dx[i]
            ncol = col + self.dy[i]

            if 1<=nrow<=2 and 1<=ncol<=2 and cube[face_index][nrow][ncol] == color_number:
                surrounding_piece = (self.dx[i], self.dy[i])
                break
        
        return surrounding_piece
    
    def make_other_4_centers(self, cube):
        pos_of_colors={
            "Green": "Right",
            "Orange": "Front",
            "Blue": "Left",
            "Red": "Back"
        }

        list_of_colors=["Green", "Orange", "Blue", "Red"]

        self.make_third_color(cube=cube, color="Green", center_index=5)
        self.make_forth_center(cube=cube, color="Orange", center_index=2)
        self.make_fifth_center(cube=cube, color="Blue", center_index=4)



    
    def make_forth_center(self, cube, color, center_index):
        print("\n================= Completing fourth square..")
        count_of_pieces_at_center = self.__count_pieces(face=cube[center_index], color=color)
        print(f"{count_of_pieces_at_center=}")
        if count_of_pieces_at_center == 4:
            print("Fourth center finished: Orange")
            return
        
        if count_of_pieces_at_center == 3:
            print("L shaped case for fourth color: Orange")
            return
        

        color_number = self.colors_indices["Orange"]
        while count_of_pieces_at_center != 4:
            count_of_pieces_at_center = self.__count_pieces(face=cube[center_index], color=color)
            if count_of_pieces_at_center == 4:
                print("Fourth center finished: Orange")
                return
            
            piece = self.collect_centre_pieces(cube=cube, color=color, skip_face=[center_index])
            if piece is None or not piece:
                print("Fourth center finished: Orange")
                return
            
            print(f"{piece=}")
            face_index, row, col = piece
            if count_of_pieces_at_center == 3:
                print("L shaped case for fourth color: Orange")
                print(f"{piece=}")
                # check if piece's row is 1 or 2
                match face_index:
                    case 0:
                        print("I m at back!")
                    case 1:
                        print("I m at top!")
                    case 3:
                        print("I m at bottom!")
                    case 4:
                        print("I m at left")
                        if row == 1:
                            # row = 1 meaning, non-paired piece is on the second row.
                            unpaired_piece = None
                            if cube[center_index][2][1] == color_number:
                                unpaired_piece = (2, 1)
                            else:
                                unpaired_piece = (2, 2)
                            
                            print(f"{unpaired_piece=}")
                            if cube[center_index][1][1] == color_number and cube[center_index][1][2] == color_number:
                                print("We are on the same track")
                                final_piece_should_come_at = (1, 2) if unpaired_piece == (2, 2) else (1, 1)
                                rotation = -1 if (final_piece_should_come_at[0] - row) < 0 or (final_piece_should_come_at[1] - col) < 0 else 1
                                if (row, col) != final_piece_should_come_at:
                                    print("We need to rotate face")
                                else:
                                    print("Just bring it together")
                                    self.rotate_inner_sides(cube=cube, side="Top", direction=-1)
                                    direction = -1 if unpaired_piece[1] == 1 else 1
                                    self.rotate_z(cube=cube, side="Front", direction=direction)
                                    self.rotate_inner_sides(cube=cube, side="Top", direction=1)
                            elif cube[center_index][2][1] == color and cube[center_index][2][2] == color_number:
                                print("We are on opposite track")
                            elif cube[center_index][1][1] == color_number and cube[center_index][2][1] == color_number:
                                print("We are orthogonal upside")
                            elif cube[center_index][1][2] == color_number and cube[center_index][2][2] == color_number:
                                print("We are orthogonal downside")
                        else:
                            pass
                    case 5:
                        print("I m at right")
                
            
            match face_index:
                case 0:
                    print("I am at back face")
                    surrounding_piece = self.__check_adjacent_piece(piece=piece, cube=cube, color_number=color_number)
                    print(f"{surrounding_piece=}")

                    if surrounding_piece is None:
                        print("Lone warrier...")
                        # either there are two colors at front face
                        if count_of_pieces_at_center == 2:
                            print("We are couples at front face. Orange")
                            # now there are 6 cases
                            # case 1: side ways
                            if cube[center_index][1][1] == color_number and cube[center_index][1][2] == color_number:
                                print("Flipping first row.")
                            elif cube[center_index][2][1] == color_number and cube[center_index][2][2] == color_number:
                                print("Flipping second row.")
                                rotation = 1 if col == 1 else -1
                                print(f"Rotating {"clockwise" if rotation == 1 else "anti-clockwise"}")
                                self.rotate_z(cube=cube, side="Front", direction=rotation)
                                print("Bring back piece to front")
                                side = "Right" if col == 2 else "Left"
                                self.rotate_inner_sides(cube=cube, side=side, direction=1)
                                self.rotate_inner_sides(cube=cube, side=side, direction=1)
                                print("Rotating front face twice")
                                self.rotate_z(cube=cube, side="Front", direction=1)
                                self.rotate_z(cube=cube, side="Front", direction=1)
                                print("Bringing inner side back")

                                self.rotate_inner_sides(cube=cube, side=side, direction=-1)
                                self.rotate_inner_sides(cube=cube, side=side, direction=-1)

                            elif cube[center_index][1][col] == color_number and cube[center_index][2][col] == color_number:
                                print("Flipping same column.")
                            elif cube[center_index][1][1] == color_number and cube[center_index][2][2] == color_number:
                                print("Left diagonal")
                            elif cube[center_index][1][2] == color_number and cube[center_index][2][1] == color_number:
                                print("Right diagonal")
                        # or only one color
                        else:
                            print("We are singles at front face. Orange")
                    
                    else:
                        print("Hey! I got a neighbour...")
                case 1:
                    print("I am at top")
                case 3:
                    print("I am at bottom")
                case 4:
                    print("I am at left")
                case 5:
                    print("I am at right")
                case _:
                    pass
            
                    
    
    def make_fifth_center(self, cube, color, center_index):
        print("\n================== Making fifth center\n")
        count_of_pieces_at_center = self.__count_pieces(face=cube[center_index], color=color)
        print(f"{count_of_pieces_at_center=}")

        if count_of_pieces_at_center == 4:
            print("Fifth center is finished: Blue")
            return

        if count_of_pieces_at_center == 3:
            print("Handling L shaped: Blue")
            return
        
        color_number = self.colors_indices[color]
        count = 0
        
        while count_of_pieces_at_center != 4:
            piece = self.collect_centre_pieces(cube=cube, color=color, skip_face=[center_index])
            face_index, row, col = piece

            if count_of_pieces_at_center == 4:
                print("Fifth center is finished: Blue")
                return
            
            if count_of_pieces_at_center == 3:
                print("L shaped case for Fifth center: Blue")
                return
            
            if piece is None or not piece:
                print("Fifth center is finished: Blue")
                return
            
            surrounding_piece = self.__check_adjacent_piece(piece=piece, cube=cube, color_number=color_number)
            print(f"{surrounding_piece=}")
            count += 1

            match face_index:
                case 0:
                    print("I am at back!")
                    if surrounding_piece is not None:
                        print("I have a neighbour!")
                        final_piece = (row+surrounding_piece[0], col+surrounding_piece[1])
                        position_of_surrounding_piece = self.directions[surrounding_piece]
                        match position_of_surrounding_piece:
                            case "Right":
                                print("I am at right")
                            case "Left":
                                print("I am at left")
                            case "Up":
                                print("I am at up")
                            case "Down":
                                print("I am at down")
                                if col == 1:
                                    print("I am at col 1")
                                    self.rotate_z(cube=cube, side="Back", direction=1)
                                else:
                                    print("I am at col 2")
                                    self.rotate_z(cube=cube, side="Back", direction=-1) # this brings blue colors at top row
                                    if cube[center_index][1][1] == color_number and cube[center_index][1][2] == color_number:
                                        print("I am on same row, bring it on.")
                                    elif cube[center_index][2][1] == color_number and cube[center_index][2][2] == color_number:
                                        print("I am on opposite row, time to rotate me")
                                    elif cube[center_index][1][1] == color_number and cube[center_index][2][1] == color_number:
                                        print("I am orthogonal, at col 1")
                                    elif cube[center_index][1][2] == color_number and cube[center_index][2][2] == color_number:
                                        print("I am orthogonal, at col 2")
                                        self.rotate_x(cube=cube, side="Left", direction=1)
                                        self.rotate_inner_sides(cube=cube, side="Bottom", direction=-1)
                                        self.rotate_x(cube=cube, side="Left", direction=1)
                                        self.rotate_x(cube=cube, side="Left", direction=1)
                                        self.rotate_inner_sides(cube=cube, side="Bottom", direction=1)
                            case "Right Down":
                                print("I am at right down")
                                self.rotate_inner_sides(cube=cube, side="Bottom", direction=-1)
                                self.rotate_x(cube=cube, side="Left", direction=1)
                                self.rotate_inner_sides(cube=cube, side="Bottom", direction=1)
                            case "Left Down":
                                print("I am at left down")
                            case "Right Up":
                                print("I am at right up")
                            case "Left Up":
                                print("I am at left up")
                            
                    else:
                        print("I am a lone warrier..")
                    if count == 2:
                        return
                case 1:
                    print("I am at top")
                    return
                case 2:
                    print("I am at front")
                    return
                case 3:
                    print("I am at bottom")
                    return
                case 5:
                    print("I am at right")
                    return


    
    
    def make_centre(self, cube, color, is_center_complete, face_to_make_color):
        centre_positions = self.collect_centre_pieces(cube, color)
        centre_positions.sort(key=lambda x:x[0])

        # face_to_make_color means here we have to make center
        face_index = self.faces_indices[face_to_make_color]
        color_number = self.colors_indices[color]

        print(f"{face_index=}")
        print(f"{color_number=}")

        for pieces in centre_positions:
            print(pieces)
            face, row, col = pieces
            if not is_center_complete:
                """
                create a centre on face_index
                """
                # let's find which side to rotate and how many times?
                # direction, we are considering clockwise

                # if we have same color piece on same plane
                """
                X X X X
                X W X X
                X X W X
                """
                if face == face_index:
                    """
                    case 1:
                        W X
                        X X

                    case 2:
                        W W
                        X X

                    case 3:
                        W X
                        X W

                        or

                        X W
                        W X

                    case 4:
                        W W
                        W X

                        or 

                        W X
                        W W

                        or 

                        X W
                        W W

                        or 

                        W W
                        X W
                    """

                    # case 3
                    nrow, ncol = row+1, col+1
                    if 1<=nrow<=2 and 1<=ncol<=2 and cube[face][nrow][ncol] == color_number:
                        """
                        W X
                        X W
                        """
                        print("We got the diagonal condition of row+1 and col+1")
                        self.rotate_inner_sides(cube=cube, side="Right", direction=1)

                    nrow, ncol = row-1, col-1
                    if 1<=nrow<=2 and 1<=ncol<=2 and cube[face][nrow][ncol] == color_number:
                        """
                        X W
                        W X
                        """
                        print("We got the diagonal condition of row-1 and col-1")
                        self.rotate_inner_sides(cube=cube, side="Left", direction=1)

                else:
                    # centre piece is present somewhere else
                    """
                    bringing centre to desired face_index
                    """







