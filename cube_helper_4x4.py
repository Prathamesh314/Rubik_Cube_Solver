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

        self.colors_indices = {
            "White": 1,
            "Blue": 2,
            "Yellow": 3,
            "Green": 4,
            "Red": 5,
            "Orange": 6
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
                    cube[back_index][back_face_index] = reversed(cube[left_index][row_index])
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
                    back_face_index = 1 if row_index == self.n-1 else self.n-2

                    front_index = self.faces_indices["Front"]
                    right_index = self.faces_indices["Right"]
                    left_index = self.faces_indices["Left"]
                    back_index = self.faces_indices["Back"]
                    
                    temp_front_row = cube[front_index][row_index]
                    cube[front_index][row_index] = cube[right_index][row_index]
                    cube[right_index][row_index] = cube[back_index][back_face_index]
                    cube[back_index][back_face_index] = reversed(cube[left_index][row_index])
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


    def collect_centre_pieces(self, cube, color):
        centre_pieces = []
        if color not in self.colors_indices:
            raise Exception(f"Color: {color} is an invalid color.\n Choose from Red, White, Yellow, Green, Blue, Orange.")
        color_index = self.colors_indices[color]
        
        for face_idx in range(len(cube)):
            for row in range(1, 3):
                for col in range(1, 3):
                    if cube[face_idx][row][col] == color_index:
                        centre_pieces.append((face_idx, row, col))
        
        return centre_pieces
    

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

    def make_centre(self, cube, color, is_center_complete, face_to_make_color):
        centre_positions = self.collect_centre_pieces(cube, color)
        centre_positions.sort(key=lambda x:x[0])

        # face_to_make_color means here we have to make center
        face_index = self.faces_indices[face_to_make_color]

        for pieces in centre_positions:
            face, row, col = pieces
            if not is_center_complete:
                """
                create a centre on face_index
                """




