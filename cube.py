#print("Hello World")

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

    def rotate_Y(self, dir, row):
        if dir == -1:
            # move Left
            # Let us first find
            # If it is top row then bottom face wont be affected
            if row == 0:
                face = self.scrambled_cube[self.dirs["Face"]]
                right =  self.scrambled_cube[self.dirs["Right"]]
                left =  self.scrambled_cube[self.dirs["Left"]]
                back =  self.scrambled_cube[self.dirs["Back"]]
                top =  self.scrambled_cube[self.dirs["Top"]]
                temp = face[0]
                face[0] = right[0]
                right[0] = back[0]
                back[0] = left[0]
                left[0] = temp
                
                # rotate top face to Left
                
                new_top = [[0]*3 for _ in range(3)]
                n = len(face)
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_top[i][j] = top[j][n-i-1]
                self.scrambled_cube[self.dirs["Top"]] = new_top 
               
            else:
                # If it is bottom row then top face wont be affected
                face = self.scrambled_cube[self.dirs["Face"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = face[n-1]
                face[n-1] = right[n-1]
                right[n-1] = back[n-1]
                back[n-1] = left[n-1]
                left[n-1] = temp

                # rotate bottom face to left
                
                new_bottom = [[0]*3 for _ in range(3)]
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_bottom[i][j] = bottom[j][n-i-1]
                self.scrambled_cube[self.dirs["Bottom"]] = new_bottom
        else:
            # Moving to right side
            # Again check top row or bottom row
            if row == 0:
                # bottom face wont get affected every other face will turn
                face = self.scrambled_cube[self.dirs["Face"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                top = self.scrambled_cube[self.dirs["Top"]]
                temp = face[0]
                face[0] = left[0]
                left[0] = back[0]
                back[0] = right[0]
                right[0] = temp
            
                # rotate top face to right side
                new_top = [[0]*3 for _ in range(3)]
                n = len(face)
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_top[i][j] = top[n-j-1][i]
                self.scrambled_cube[self.dirs["Top"]] = new_top 
            else:
                # Top face wont get affected
                face = self.scrambled_cube[self.dirs["Face"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = face[n-1]
                face[n-1] = left[n-1]
                left[n-1] = back[n-1]
                back[n-1] = right[n-1]
                right[n-1] = temp 
                
                m = len(face[0])
                new_bottom = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(m):
                        new_bottom[i][j] = bottom[n-j-1][i]
                self.scrambled_cube[self.dirs["Bottom"]] = new_bottom
    def rotate_X(self, dir, col):
        # First check whether to rotate 
        if dir == 1:
            # now check which column to rotate
            if col == 0:
                # right face wont get affected
                top = self.scrambled_cube[self.dirs["Top"]]
                face = self.scrambled_cube[self.dirs["Face"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                
                for i in range(n):
                    top[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = temp[i]
                
                # Now lets rotate left face in left direction
                new_left = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_left[i][j] = left[j][n-i-1]
                self.scrambled_cube[self.dirs["Left"]] = new_left
            else:
                # Left wont get affected
                top = self.scrambled_cube[self.dirs["Top"]]
                face = self.scrambled_cube[self.dirs["Face"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                
                for i in range(n):
                    top[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = temp[i]
                
                # Now lets rotate left face in left direction
                new_right = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_right[i][j] = right[n-1-j][i]
                self.scrambled_cube[self.dirs["Right"]] = new_right
        
        else:
            # rotating in other direction
             if col == 0:
                # right face wont get affected
                top = self.scrambled_cube[self.dirs["Top"]]
                face = self.scrambled_cube[self.dirs["Face"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                back = self.scrambled_cube[self.dirs["Back"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                
                for i in range(n):
                    top[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = temp[i]
                
                # Now lets rotate left face in left direction
                new_left = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_left[i][j] = left[n-1-j][i]
                self.scrambled_cube[self.dirs["Left"]] = new_left
             else:
                 top = self.scrambled_cube[self.dirs["Top"]]
                 face = self.scrambled_cube[self.dirs["Face"]]
                 bottom = self.scrambled_cube[self.dirs["Bottom"]]
                 back = self.scrambled_cube[self.dirs["Back"]]
                 right = self.scrambled_cube[self.dirs["Right"]]
                 temp = []
                 n = len(face)
                 for i in range(n):
                     temp.append(top[i][col])
                 
                 for i in range(n):
                     top[i][col] = back[i][col]
                 for i in range(n):
                     back[i][col] = bottom[i][col]
                 for i in range(n):
                     bottom[i][col] = face[i][col]
                 for i in range(n):
                     face[i][col] = temp[i]
                
                 # Now lets rotate left face in left direction
                 new_right = [[0]*3 for _ in range(3)]
                 for i in range(n):
                     for j in range(n):
                         new_right[i][j] = right[j][n-1-i]
                 self.scrambled_cube[self.dirs["Right"]] = new_right
    def rotate_Z(self, dir, row):
        if dir == 1:
            if row == 0:
                # back wont get affected
                face = self.scrambled_cube[self.dirs["Face"]]
                top = self.scrambled_cube[self.dirs["Top"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = top[row]
                for i in range(n):
                    top[row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = bottom[n-1-row][i]
                
                for i in range(n):
                    bottom[n-1-row][i] = right[i][n-1-row]  
                for i in range(n):
                    right[i][n-1-row] = temp[i]
                
                # now rotating front face
                new_face = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_face[i][j] = face[n-1-j][i]
                self.scrambled_cube[self.dirs["Face"]] = new_face
            else:
                # front face wont get affected
                back = self.scrambled_cube[self.dirs["Back"]]
                top = self.scrambled_cube[self.dirs["Top"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                n = len(top)
                temp = top[row]
                for i in range(n):
                    top[row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = bottom[n-1-row][i]
                for i in range(n):
                    bottom[n-1-row][i] = right[i][n-1-row]
                for i in range(n):
                    right[i][n-1-row] = temp[i]
                
                # Lets rotate back face in right direction
                new_back = [[0]*3 for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        new_back[i][j] = back[n-j-1][i]
                self.scrambled_cube[self.dirs["Back"]] = new_back
        else:
            if row == 0:
                face = self.scrambled_cube[self.dirs["Face"]]
                top = self.scrambled_cube[self.dirs["Top"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = top[row]
                for i in range(n):
                    top[row][i] = right[i][n-1-row]
                for i in range(n):
                    right[i][n-1-row] = bottom[n-1-row][i]
                for i in range(n):
                    bottom[n-1-row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = temp[i]
                
                # Left rotate face to Left
                new_face = [[0]*3 for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        new_face[i][j] = face[j][n-1-i]
                self.scrambled_cube[self.dirs["Face"]] = new_face
            else:
                back = self.scrambled_cube[self.dirs["Back"]]
                top = self.scrambled_cube[self.dirs["Top"]]
                left = self.scrambled_cube[self.dirs["Left"]]
                right = self.scrambled_cube[self.dirs["Right"]]
                bottom = self.scrambled_cube[self.dirs["Bottom"]]
                temp = top[row]
                n = len(back)
                for i in range(n):
                    top[row][i] = right[i][n-1-row]
                for i in range(n):
                    right[i][n-1-row] = bottom[n-1-row][i]
                for i in range(n):
                    bottom[n-1-row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = temp[i]
                
                new_back = [[0]*3 for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        new_back[i][j] = back[j][n-1-i]
                self.scrambled_cube[self.dirs["Back"]] = new_back

cube = Cube(2)
print("Original Scrambled Cube")
cube.show_scramble_cube()
cube.rotate_Z(-1, 2)
print("After rotating Front Face to Right side")
cube.show_scramble_cube()

