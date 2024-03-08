class CubeTemplate:
    def __init__(self, cube):
        self.Cube = cube
    
    def handle_layer1(self):
        while self.Cube.solve_level_one("Yellow") == 0:
            self.Cube.solve_level_one("Yellow")
        while self.Cube.bring_edge_pieces_to_bottom("Yellow") == 0:
            self.Cube.bring_edge_pieces_to_bottom("Yellow")
        while self.Cube.handle_corner_pieces("Yellow") == 0:
            self.Cube.handle_corner_pieces("Yellow")
        print("Cube after level 1")
        self.Cube.show_cube()

    def handle_layer2(self):
        while self.Cube.hande_layer2("Yellow") == 0:
            self.Cube.hande_layer2("Yellow")

        print("Cube after layer 2")
        self.Cube.show_cube()

    def handle_layer3(self):
        self.Cube.handle_top_layer_figures("Yellow")
        self.Cube.show_cube()
        print("Cube is solved....")

    def run(self):
        print("Let's start solving cube....")
        
        self.handle_layer1()
        #self.handle_layer2()
        #self.handle_layer3()
        
        #print("Rubik cube is solved....")
