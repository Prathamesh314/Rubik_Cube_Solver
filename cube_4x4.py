class Solver4x4:
    def __init__(self) -> None:
        self.colors = {
            1: "W",
            2: "B",
            3:"Y",
            4: "G",
            5: "R",
            6: "O"
        }
        self.cube = [
            [
                # back face
                [2, 5, 3, 1],
                [3, 6, 3, 5],
                [3, 2, 3, 4],
                [3, 2, 4, 4]
            ],
            [
                # top face
                [6, 5, 6, 1],
                [1, 3, 1, 2],
                [1, 4, 5, 4],
                [4, 6, 4, 3]
            ],
            [
                # front face
                [1, 1, 1, 2],
                [2, 1, 4, 6],
                [4, 6, 5, 1],
                [2, 6, 2, 3]
            ],
            [
                # bottom face
                [6, 2, 3, 5],
                [4, 2, 4, 5],
                [3, 3, 6, 6],
                [6, 1, 4, 2]
            ],
            [
                # left face
                [4, 6, 5, 5],
                [2, 1, 5, 1],
                [6, 2, 1, 5],
                [1, 5, 6, 3]
            ],
            [
                # right face
                [5, 3, 5, 6],
                [2, 2, 5, 1],
                [2, 6, 4, 3],
                [4, 4, 3, 5]
            ],
        ]

    
    def print_face(self, idx):
        if idx == 0:
            print("Back Face")
        elif idx == 1:
            print("Top Face")
        elif idx == 2:
            print("Front Face")
        elif idx == 3:
            print("Bottom Face")
        elif idx == 4:
            print("Left Face")
        else:
            print("Right Face")
        print()
    

    def show_cube(self):
        for idx, faces in enumerate(self.cube):
            self.print_face(idx)
            for face in faces:

                for f in face:
                    print(self.colors[f], end=" ")
                print()
            print("==================================")


    