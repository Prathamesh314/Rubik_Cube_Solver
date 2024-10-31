from cube_4x4 import Solver4x4
from cube_helper_4x4 import Helper4x4

cube = Solver4x4()
helper = Helper4x4(cube=cube)

# helper.rotate_x(side="R", direction=1)
helper.show_cube()