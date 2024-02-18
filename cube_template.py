class CubeTemplate:
    def __init__(self, cube):
        self.Cube = cube
    
    def handle_layer1(self):
        pass

    def handle_layer2(self):
        pass

    def handle_layer3(self):
        pass

    def run(self):
        print("Let's start solving cube....")
        
        self.handle_layer1()
        self.handle_layer2()
        self.handle_layer3()
        
        print("Rubik cube is solved....")
