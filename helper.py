
class CubeHelper:
    def __init__(self, dirs):
        self.dirs = dirs

    def rotate_Y(self, scramble_cube, dir, row):
        if dir == -1:
            if row == 0:     
                face = scramble_cube[self.dirs["Face"]]
                right = scramble_cube[self.dirs["Right"]]
                left = scramble_cube[self.dirs["Left"]]
                back = scramble_cube[self.dirs["Back"]]
                top = scramble_cube[self.dirs["Top"]]
                temp = face[0]
                temp = temp.copy()
                face[0] = right[0]
                right[0] = back[2]
                back[2] = left[0]
                left[0] = temp

                new_top = [[0]*3 for _ in range(3)]
                n = len(face)
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_top[i][j] = top[n-1-j][i]
                scramble_cube[self.dirs["Top"]] = new_top
            else:
                face = scramble_cube[self.dirs["Face"]]
                right = scramble_cube[self.dirs["Right"]]
                left = scramble_cube[self.dirs["Left"]]
                back = scramble_cube[self.dirs["Back"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = face[n-1]
                temp = temp.copy()
                face[n-1] = right[n-1]
                right[n-1] = back[0]
                back[0] = left[n-1]
                left[n-1] = temp

                new_bottom = [[0]*3 for _ in range(3)]
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_bottom[i][j] = bottom[j][n-i-1]
                scramble_cube[self.dirs["Bottom"]] = new_bottom
        else:
            if row == 0:
                face = scramble_cube[self.dirs["Face"]]
                right = scramble_cube[self.dirs["Right"]]
                left = scramble_cube[self.dirs["Left"]]
                back = scramble_cube[self.dirs["Back"]]
                top = scramble_cube[self.dirs["Top"]]
                temp = face[0]
                temp = temp.copy()
                face[0] = left[0]
                left[0] = back[2]
                back[2] = right[0]
                right[0] = temp

                new_top = [[0]*3 for _ in range(3)]
                n = len(face)
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_top[i][j] = top[n-j-1][i]
                scramble_cube[self.dirs["Top"]] = new_top
            else:
                face = scramble_cube[self.dirs["Face"]]
                right = scramble_cube[self.dirs["Right"]]
                left = scramble_cube[self.dirs["Left"]]
                back = scramble_cube[self.dirs["Back"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = face[n-1]
                temp = temp.copy()
                face[n-1] = left[n-1]
                left[n-1] = back[0]
                back[0] = right[n-1]
                right[n-1] = temp

                new_bottom = [[0]*3 for _ in range(3)]
                m = len(face[0])
                for i in range(n):
                    for j in range(m):
                        new_bottom[i][j] = bottom[n-j-1][i]
                scramble_cube[self.dirs["Bottom"]] = new_bottom

    def rotate_X(self, scrambled_cube, dir, col):
        if dir == 1:
            if col == 0:
                top = scrambled_cube[self.dirs["Top"]]
                face = scrambled_cube[self.dirs["Face"]]
                bottom = scrambled_cube[self.dirs["Bottom"]]
                back = scrambled_cube[self.dirs["Back"]]
                left = scrambled_cube[self.dirs["Left"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                temp = temp.copy()
                for i in range(n):
                    top[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = temp[i]

                new_left = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_left[i][j] = left[j][n-1-i]
                scrambled_cube[self.dirs["Left"]] = new_left
            else:
                top = scrambled_cube[self.dirs["Top"]]
                face = scrambled_cube[self.dirs["Face"]]
                bottom = scrambled_cube[self.dirs["Bottom"]]
                back = scrambled_cube[self.dirs["Back"]]
                right = scrambled_cube[self.dirs["Right"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                temp = temp.copy()
                for i in range(n):
                    top[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = temp[i]

                new_right = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_right[i][j] = right[n-1-j][i]
                scrambled_cube[self.dirs["Right"]] = new_right
        else:
            if col == 0:
                top = scrambled_cube[self.dirs["Top"]]
                face = scrambled_cube[self.dirs["Face"]]
                bottom = scrambled_cube[self.dirs["Bottom"]]
                back = scrambled_cube[self.dirs["Back"]]
                left = scrambled_cube[self.dirs["Left"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                temp = temp.copy()
                for i in range(n):
                    top[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = temp[i]

                new_left = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_left[i][j] = left[n-1-j][i]
                scrambled_cube[self.dirs["Left"]] = new_left
            else:
                top = scrambled_cube[self.dirs["Top"]]
                face = scrambled_cube[self.dirs["Face"]]
                bottom = scrambled_cube[self.dirs["Bottom"]]
                back = scrambled_cube[self.dirs["Back"]]
                right = scrambled_cube[self.dirs["Right"]]
                temp = []
                n = len(face)
                for i in range(n):
                    temp.append(top[i][col])
                temp = temp.copy()
                for i in range(n):
                    top[i][col] = back[i][col]
                for i in range(n):
                    back[i][col] = bottom[i][col]
                for i in range(n):
                    bottom[i][col] = face[i][col]
                for i in range(n):
                    face[i][col] = temp[i]

                new_right = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_right[i][j] = right[j][n-1-i]
                scrambled_cube[self.dirs["Right"]] = new_right

    def rotate_Z(self, scramble_cube, dir, row):
        if dir == 1:
            if row == 2:
                face = scramble_cube[self.dirs["Face"]]
                top = scramble_cube[self.dirs["Top"]]
                right = scramble_cube[self.dirs["Right"]]
                left = scramble_cube[self.dirs["Left"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = top[row]
                temp = temp.copy()

                for i in range(n):
                    top[row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = bottom[n-1-row][i]

                for i in range(n):
                    bottom[n-1-row][i] = right[i][n-1-row]  
                for i in range(n):
                    right[i][n-1-row] = temp[i]

                new_face = [[0]*3 for _ in range(3)]
                for i in range(n):
                    for j in range(n):
                        new_face[i][j] = face[n-1-j][i]
                scramble_cube[self.dirs["Face"]] = new_face
            else:
                back = scramble_cube[self.dirs["Back"]]
                top = scramble_cube[self.dirs["Top"]]
                left = scramble_cube[self.dirs["Left"]]
                right = scramble_cube[self.dirs["Right"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                n = len(top)
                temp = top[row]
                temp = temp.copy()
                for i in range(n):
                    top[row][i] = left[n-1-i][row]
                for i in range(n):
                    left[i][row] = bottom[n-1-row][i]
                for i in range(n):
                    bottom[n-1-row][i] = right[i][n-1-row]
                for i in range(n):
                    right[i][n-1-row] = temp[i]
                #print(f"Right after: {right}")
                new_back = [[0]*3 for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        new_back[i][j] = back[n-j-1][i]
                scramble_cube[self.dirs["Back"]] = new_back
        else:
            if row == 2:
                face = scramble_cube[self.dirs["Face"]]
                top = scramble_cube[self.dirs["Top"]]
                left = scramble_cube[self.dirs["Left"]]
                right = scramble_cube[self.dirs["Right"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                n = len(face)
                temp = top[row]
                temp = temp.copy()
                for i in range(n):
                    top[row][i] = right[i][n-1-row]
                for i in range(n):
                    right[i][n-1-row] = bottom[n-1-row][i]
                for i in range(n):
                    bottom[n-1-row][i] = left[i][row]
                for i in range(n):
                    left[i][row] = temp[i]
                new_face = [[0]*3 for _ in range(n)]
                for i in range(n):
                    for j in range(n):
                        new_face[i][j] = face[j][n-1-i]
                scramble_cube[self.dirs["Face"]] = new_face
            else:
                back = scramble_cube[self.dirs["Back"]]
                top = scramble_cube[self.dirs["Top"]]
                left = scramble_cube[self.dirs["Left"]]
                right = scramble_cube[self.dirs["Right"]]
                bottom = scramble_cube[self.dirs["Bottom"]]
                temp = top[row]
                temp = temp.copy()
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
                scramble_cube[self.dirs["Back"]] = new_back

