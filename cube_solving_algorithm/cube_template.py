class CubeTemplate:
    def __init__(self, cube):
        self.Cube = cube
        print(f"Cube: {self.Cube.scrambled_cube}")
    
    def handle_layer1(self):
        while self.Cube.solve_level_one("Green") == 0:
            self.Cube.solve_level_one("Green")
        while self.Cube.bring_edge_pieces_to_bottom("Green") == 0:
            self.Cube.bring_edge_pieces_to_bottom("Green")
        while self.Cube.handle_corner_pieces("Green") == 0:
            self.Cube.handle_corner_pieces("Green")

    def handle_layer2(self):
        while self.Cube.hande_layer2("Green") == 0:
            self.Cube.hande_layer2("Green")


    def handle_layer3(self):
        self.Cube.handle_top_layer_figures("Green")

    def run(self):
        print("Let's start solving cube....")
        
        self.handle_layer1()
        self.handle_layer2()
        self.handle_layer3()
        
        print("Rubik cube is solved....")
