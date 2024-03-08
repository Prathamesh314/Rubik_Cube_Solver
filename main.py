from cube_template import CubeTemplate
from cube import Cube
import numpy as np


from rubik import Rubic_Cube

sequence_list = []



scramble_cube = []
final_cube = []

colors_dict = {
    "Red": 2,
    "White": 1,
    "Yellow": 3,
    "Blue": 6,
    "Green": 5,
    "Orange": 4,
}

def return_color(l):
    if l == [1.0, 0.0, 0.0]:
        return colors_dict["Red"]
    elif l == [1.0, 1.0, 0.0]:
        return colors_dict["Yellow"]
    elif l == [1.0, 0.5, 0.0]:
        return colors_dict["Orange"]
    elif l == [1.0, 1.0, 1.0]:
        return colors_dict["White"]
    elif l == [0.0, 0.0, 1.0]:
        return colors_dict["Blue"]
    else:
        return colors_dict["Green"]


sequence = [5, 1, 6, 3, 4, 2]

def scramble(moves, cube):
    cube.build_scramble_cube(moves)

if __name__ == "__main__":
    # ctemplate.run()
    cubex = Rubic_Cube()
    cubex.scramble()

    moves = cubex.moves
    print(moves)
    for _ in range(6):
        scramble_cube.append(cubex.tiles[9 * _: 9 * (_ + 1)])
    for i in scramble_cube:
        k = []
        for j in range(3):
            k.append(i[3 * j: 3 * (j + 1)])
        final_cube.append(k)

    for _ in range(len(final_cube)):
        for i in range(len(final_cube[0])):
            for j in range(len(final_cube[0][0])):
                a, b, c = final_cube[_][i][j].color.x, final_cube[_][i][j].color.y, final_cube[_][i][j].color.z
                final_cube[_][i][j] = return_color([a, b, c])

    # print(final_cube)
    for seq in sequence:
        for i in final_cube:
            if i[1][1] == seq:
                sequence_list.append(i)
    print(sequence_list)
    cubee = Cube(2, sequence_list)
    scramble(moves, cubee)
    cubee.show_cube()
    # ctemplate = CubeTemplate(cubee)
    # ctemplate.run()
    # ans = cubee.get_moves()
    # print(ans)
    # for _ in final_cube:
    #     for k in _:
    #         print(k)
    #     print()
    # for _ in cubex.tiles:
    #     a, b, c = _.color.x, _.color.y, _.color.z
    #     if [a, b, c] == [1.0, 0.0, 0.0]:
    #         print("Red")
    #     elif [a, b, c] == [1.0, 1.0, 0.0]:
    #         print("Yellow")
    #     elif [a, b, c] == [1.0, 0.5, 0.0]:
    #         print("Orange")
    #     elif [a, b, c] == [1.0, 1.0, 1.0]:
    #         print("White")
    #     elif [a, b, c] == [0.0, 0.0, 1.0]:
    #         print("Blue")
    #     else:
    #         print("Green")
    #     break
    cubex.start()