from ursina import *

app = Ursina()
Entity(
    model="quad",
    scale=60,
    texture="white_cube",
    texture_scale=(60, 60),
    rotation_x=90,
    y=-5,
    color=color.light_gray,
)
Entity(model="sphere", scale=200, texture="textures/sky0", double_sided=True)
# cube = Entity(model="models/custom_cube", texture="textures/rubik_texture")
modell = "models/custom_cube"
texxture = "textures/rubik_texture"
EditorCamera()
camera.world_position = (0, 0, -15)
LEFT, RIGHT, UP, DOWN, FACE, BACK = Vec3, Vec3, Vec3, Vec3, Vec3, Vec3
POSITION = []
CUBES = []
rotation_axes = {}
cube_side_position = {}
PARENT = Entity(model=modell, texture=texxture)

Entity(parent=PARENT, model=modell, texture=texxture, position=(1, 1, -1))
# rot = 0
#
#
# def update():
#     PARENT.rotation_x += held_keys["b"] * 90
#     PARENT.rotation_y += held_keys["t"] * 90
#     PARENT.rotation_z += held_keys["f"] * 90

#
LEFT = {Vec3(-1, y, z) for y in range(-1, 2) for z in range(-1, 2)}
RIGHT = {Vec3(1, y, z) for y in range(-1, 2) for z in range(-1, 2)}
UP = {Vec3(x, 1, z) for x in range(-1, 2) for z in range(-1, 2)}
DOWN = {Vec3(x, -1, z) for x in range(-1, 2) for z in range(-1, 2)}
FACE = {Vec3(x, y, -1) for x in range(-1, 2) for y in range(-1, 2)}
BACK = {Vec3(x, y, 1) for x in range(-1, 2) for y in range(-1, 2)}
POSITION = LEFT | RIGHT | UP | DOWN | FACE | BACK

CUBES = [Entity(model=modell, texture=texxture, position=pos) for pos in POSITION]
print(CUBES)
# rotation_axes = {
#     "LEFT": "x",
#     "RIGHT": "x",
#     "UP": "y",
#     "DOWN": "y",
#     "FACE": "z",
#     "BACK": "z",
# }
# cube_side_position = {
#     "LEFT": LEFT,
#     "RIGHT": RIGHT,
#     "UP": UP,
#     "DOWN": DOWN,
#     "FACE": FACE,
#     "BACK": BACK,
# }
# def update():
#     get_side = CUBES[1]
#     get_side.rotation_x += held_keys["R"]*0.5

app.run()
