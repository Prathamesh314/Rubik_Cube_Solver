from cube_template import CubeTemplate
from cube import Cube
import numpy as np


from rubik import Rubic_Cube

if __name__ == "__main__":
    # ctemplate.run()
    # cubex = Rubic_Cube()
    # cubex.scramble()

    # moves = cubex.moves
    # print(f"{moves=}")
    cubee = Cube(2)
    ctmeplate = CubeTemplate(cubee)
    ctmeplate.run()
    # cubex.start()