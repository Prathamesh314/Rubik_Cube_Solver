from ursina import *
import random as rd
import time

app = Ursina(fullscreen=True)
cube_model, cube_texture = 'models/custom_cube.obj', 'textures/rrr.jpeg'



# creating an entity world
Entity(model="sphere", scale=100, texture='textures/sky0', double_sided=True)

# creating a 2d plane
Entity(model="quad", scale=60, texture='white_cube', texture_scale=(60, 60), rotation_x=90, y=-5, color=color.light_gray)

camera = EditorCamera()
camera.world_position = (0, 0, -15)


PARENT = Entity()

rotate = 0

def create_cube_faces():
    LEFT = {Vec3(-1, y, z) for y in range(-1, 2) for z in range(-1, 2)}
    BOTTOM = {Vec3(x, -1, z) for x in range(-1, 2) for z in range(-1, 2)}
    FACE = {Vec3(x, y, -1) for x in range(-1, 2) for y in range(-1, 2)}
    BACK = {Vec3(x, y, 1) for x in range(-1, 2) for y in range(-1, 2)}
    RIGHT = {Vec3(1, y, z) for y in range(-1, 2) for z in range(-1, 2)}
    UP = {Vec3(x, 1, z) for x in range(-1, 2) for z in range(-1, 2)}

    CUBE_POSITIONS = LEFT | BOTTOM | FACE | BACK | RIGHT | UP
    return CUBE_POSITIONS, LEFT, BOTTOM, FACE, BACK, RIGHT, UP

cubepos, left, bottom, face, back, right, up = create_cube_faces()
CUBES = [Entity(model=cube_model, texture=cube_texture, position=pos) for pos in cubepos]

rotation_axes = {'LEFT':'x', 'RIGHT':'x', 'TOP':'y', 'BOTTOM':'y','FACE':'z', 'BACK':'z'}
cubes_side_positions = {'LEFT': left, 'BOTTOM': bottom, 'TOP': up, 'RIGHT': right, 'FACE': face, 'BACK': back}
animation_time = 0.5

def rotate_side(side_name):
    global cubes_side_positions
    global rotation_axes
    global CUBES
    global PARENT
    cube_positons = cubes_side_positions[side_name]
    rotation_axis = rotation_axes[side_name]
    reparent_to_scene(CUBES, PARENT)
    for cube in CUBES:
        if cube.position in cube_positons:
            cube.parent = PARENT
            eval(f"PARENT.animate_rotation_{rotation_axis}(90, duration=0.5)")

def rotate_side_anti(side_name):
    global cubes_side_positions
    global rotation_axes
    global CUBES
    global PARENT
    cube_positons = cubes_side_positions[side_name]
    rotation_axis = rotation_axes[side_name]
    reparent_to_scene(CUBES, PARENT)
    for cube in CUBES:
        if cube.position in cube_positons:
            cube.parent = PARENT
            eval(f"PARENT.animate_rotation_{rotation_axis}(-90, duration=0.5)")


def reparent_to_scene(cubes, parent):
    global PARENT
    for cube in cubes:
        if cube.parent == parent:
            world_pos, world_rot = round(cube.world_position, 1), cube.world_rotation
            cube.parent = scene
            cube.position, cube.rotation = world_pos, world_rot
    PARENT.rotation = 0

def input(key):
    global rotate
    global PARENT
    global cube1
    keys = dict(zip('asdwqe', 'LEFT BOTTOM RIGHT TOP FACE BACK'.split()))
    keys1 = dict(zip('poilkj', 'LEFT BOTTOM RIGHT TOP FACE BACK'.split()))
    if key in keys:
        rotate_side(keys[key])
    if key in keys1:
        rotate_side_anti(keys1[key])

moves = ['e', 'p', 'w', 'i', 'w', 'd', 'd', 'w', 'w', 'k', 'l', 'a', 'a', 'w', 'd', 'd', 'l', 'q', 'q', 'l', 'e', 'e', 'i', 'w', 'd', 'l', 'w', 'w', 'q', 'l', 'k', 'i', 'w', 'd', 'l', 'l', 'w', 'j', 'l', 'e', 'q', 'l', 'k', 'l', 'l', 'l', 'w', 'l', 'e', 'w', 'j', 'd', 'l', 'i', 'l', 'l', 'a', 'w', 'p', 'w', 'l', 'l', 'k', 'w', 'q', 'w', 'w', 'p', 'l', 'a', 'l', 'e', 'w', 'j', 'w', 'l', 'i', 'w', 'd', 'w', 'j', 'l', 'e', 'l', 'l', 'k', 'w', 'q', 'w', 'd', 'l', 'i', 'l', 'l', 'a', 'w', 'p', 'w', 'q', 'l', 'k', 'p', 'q', 'w', 'k', 'l', 'a', 'p', 'q', 'w', 'k', 'l', 'a', 'w', 'w', 'j', 'l', 'k', 'w', 'e', 'l', 'q', 'l', 'l', 'i', 's', 'd', 'o', 'i', 's', 'd', 'o', 'l', 'l', 'l', 'i', 's', 'd', 'o', 'i', 's', 'd', 'o', 'i', 's', 'd', 'o', 'i', 's', 'd', 'o', 'l', 'l', 'l']
current_move = 0

def execute_move(move):
    keys = {'a': 'LEFT', 's': 'BOTTOM', 'd': 'RIGHT', 'w': 'TOP', 'q': 'FACE', 'e': 'BACK'}
    keys1 = {'p': 'LEFT', 'o': 'BOTTOM', 'i': 'RIGHT', 'l': 'TOP', 'k': 'FACE', 'j': 'BACK'}
    if move in keys:
        rotate_side(keys[move])
    if move in keys1:
        rotate_side_anti(keys1[move])

def play_next_move():
    global current_move
    if current_move < len(moves):
        move = moves[current_move]
        execute_move(move)
        current_move += 1
    else:
        print("All moves have been executed.")

# Create a button to play the next move
next_move_button = Button(
    text="Next Move",
    color=color.azure,
    highlight_color=color.cyan,
    pressed_color=color.blue,
    scale=(0.2, 0.05),
    position=(-0.5, 0.4)
)

# Bind the button to the play_next_move function
next_move_button.on_click = play_next_move

# cube = Cube(2)
m = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

app.run()