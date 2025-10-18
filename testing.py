from cube_4x4 import Solver4x4

cube = Solver4x4()
cube.show_cube()
# cube.rotate_y(side="Top", direction=1)
cube.make_cente_squares()
for _ in range(3):
    print()
cube.show_cube()
# cube.make_cente_squares()
# cube.collect_edge_pieces()
# for _ in range(3):
#     print()
# cube.show_cube()
# print("==="*50)
# cube.make_cente_squares()
# cube.show_cube()
# cube.make_cente_squares()
