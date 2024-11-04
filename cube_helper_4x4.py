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


     
    def rotate_single_sides(self, cube, side, direction):
        if direction == 1:
            # rotating side clockwise
            match side:
                case "R" | "L" | "Right" | "Left":
                    col_idx = self.n-1 if side == "R" or side == "Right" else 0
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
                    row_index = 0 if side == 'T' or side == "Top" else self.n-1
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
                    top_row_index = self.n - 1 if side == "F" or side == "Front" else 0
                    right_col_index = 0 if side == "F" or side == "Front" else self.n-1
                    bottom_row_index = 0 if side == "F" or side == "Front" else self.n-1
                    left_col_index = self.n-1 if side == "F" or side == "Front" else 0

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
                case "R":
                    pass
                case "L":
                    pass
                case "T":
                    pass
                case "F":
                    pass
                case "Ba":
                    pass
                case "Bo":
                    pass

    
    
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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)
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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)
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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)

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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)
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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)
        
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
            self.rotate_single_sides(cube=cube, side=side, direction=direction)

        else:
            raise Exception(f"Side: {side} is an invalid side for z rotation.\nChoose Front or Back")
