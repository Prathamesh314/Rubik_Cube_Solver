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

# faces = {1: 'TOP', 2: 'TOPR', 3: 'BOTTOM', 4: 'BOTTOMR', 5: 'LEFT', 6: 'LEFTR', 7:'RIGHT', 8: 'RIGHTR', 9: 'FACE', 10: 'FACER', 11: 'BACK', 12: 'BACKR'}

# def update():
#     global faces
#     for i in range(100):
#         num = rd.randint(1, 12)
#         face = faces[num]
#         match face:
#             case "TOP":
#                 rotate_side("TOP")
#             case "TOPR":
#                 rotate_side_anti("TOP")
#             case "BOTTOM":
#                 rotate_side("BOTTOM")
#             case "BOTTOMR":
#                 rotate_side_anti("BOTTOM")
#             case "LEFT":
#                 rotate_side("LEFT")
#             case "LEFTR":
#                 rotate_side_anti("LEFT")
#             case "RIGHT":
#                 rotate_side("RIGHT")
#             case "RIGHTR":
#                 rotate_side_anti("RIGHT")
#             case "FACE":
#                 rotate_side("FACE")
#             case "FACER":
#                 rotate_side_anti("FACE")
#             case "BACK":
#                 rotate_side("BACK")
#             case "BACKR":
#                 rotate_side_anti("BACK")
#         time.sleep(1)

app.run()