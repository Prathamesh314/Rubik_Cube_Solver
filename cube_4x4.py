class Solver4x4:
    def __init__(self) -> None:
        self.cube = [
            [
                # back face
                [2, 2, 2, 2],
                [2, 2, 2, 2],
                [2, 2, 2, 2],
                [2, 2, 2, 2]
            ],
            [
                # top face
                [3, 3, 3, 3],
                [3, 3, 3, 3],
                [3, 3, 3, 3],
                [3, 3, 3, 3]
            ],
            [
                # front face
                [4, 4, 4, 4],
                [4, 4, 4, 4],
                [4, 4, 4, 4],
                [4, 4, 4, 4]
            ],
            [
                # bottom face
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1]
            ],
            [
                # left face
                [5, 5, 5, 5],
                [5, 5, 5, 5],
                [5, 5, 5, 5],
                [5, 5, 5, 5]
            ],
            [
                # right face
                [6, 6, 6, 6],
                [2, 6, 6, 3],
                [1, 6, 6, 4],
                [0, 6, 6, 8]
            ],
        ]

    
    def show_cube(self):
        for faces in self.cube:
            for face in faces:
                print(face)
            print("==================================")


    