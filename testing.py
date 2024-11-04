from cube_4x4 import Solver4x4

cube = Solver4x4()
cube.show_cube()
print("=="*50)
cube.rotate_x(side="R", direction=-1)
cube.show_cube()

