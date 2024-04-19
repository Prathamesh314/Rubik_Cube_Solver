from ursina import *
# creating a window
app = Ursina(fullscreen=True)

# creating an entity world
Entity(model="sphere", scale=100, texture='textures/sky0', double_sided=True)

# creating a 2d plane
Entity(model="quad", scale=60, texture='white_cube', texture_scale=(60, 60), rotation_x=90, y=-5, color=color.light_gray)

camera = EditorCamera()
camera.world_position = (0, 0, -15)

cube_model, cube_texture = 'models/custom_cube.obj', 'textures/rubik_texture.png'

PARENT = Entity(model=cube_model, texture=cube_texture)
# print(f"{PARENT.position=}")
rotation_y  = 90

def show(cube_entities):
    for i, j in cube_entities.items():
        j
    

# cube8 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, -1, 1))
# cube6 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, 0, 1))
# cube4 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, 1, 1))
# cube9 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, -1, 1))
# cube7 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 0, 1))
# cube5 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 1, 1))
# cube3 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, -1, 1))
# cube2 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 0, 1))
# cube1 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 1, 1))
# cube10 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 1, 0))
# cube11 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 0, 0))
# cube12 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, -1, 0))
# cube13 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, 1, 0))
# cube14 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, -1, 0))
# cube15 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 1, 0))
# cube16 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 0, 0))
# cube17 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, -1, 0))
# cube18 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 1, -1))
# cube19 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 0, -1))
# cube20 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, -1, -1))
# cube21 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, 1, -1))
# cube22 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, -1, -1))
# cube23 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 1, -1))
# cube24 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, 0, -1))
# cube25 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(-1, -1, -1))
# cube26 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(0, 0, -1))

cube_entities = {}

for i in range(-1, 2):
    for j in range(-1, 2):
        for k in range(-1, 2):
            if i == j and j == k and  i == 0:
                continue
            cube_entities[(i, j , k)] = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(i, j , k))


def rotate_right_face(direction):
    # Store the positions of the cubes in the right face
    positions = [
        (1, 1, -1),
        (1, 1, 0),
        (1, 1, 1),
        (1, 0, -1),
        (1, 0, 0),
        (1, 0, 1),
        (1, -1, -1),
        (1, -1, 0),
        (1, -1, 1)
    ]

    # Update the positions of the cubes in the right face
    for cube in positions:
        cube_entities[cube].rotation_x += 90 * direction


def rotate_left_face(direction):
    positions = [
        (-1, 1, 1),
        (-1, 1, 0),
        (-1, 1, -1),
        (-1, 0, 1),
        (-1, 0, 0),
        (-1, 0, -1),
        (-1, -1, 1),
        (-1, -1, 0),
        (-1, -1, -1)
    ]

    for cube in positions:
        cube_entities[cube].rotation_x += 90*direction

def rotate_up_face(direction):
    positions = [
        (-1, 1, 1),
        (0, 1, 1),
        (1, 1, 1),
        (-1, 1, 0),
        (0, 1, 0),
        (1, 1, 0),
        (-1, 1, -1),
        (0, 1, -1),
        (1, 1, -1)
    ]

    for cube in positions:
        cube_entities[cube].rotation_y += 90*direction

def rotate_bottom_face(direction):
    positions = [
        (-1, -1, 1),
        (0, -1, 1),
        (1, -1, 1),
        (-1, -1, 0),
        (0, -1, 0),
        (1, -1, 0),
        (-1, -1, -1),
        (0, -1, -1),
        (1, -1, -1)
    ]

    for cube in positions:
        cube_entities[cube].rotation_y += 90*direction


def input(key):
    global PARENT
    if key == 'd':
        print("Rotating bottom face clockwise")
        rotate_bottom_face(1)
    elif key == 'k':
        print("Rotating bottom face anticlockwise")
        rotate_bottom_face(-1)
        # PARENT.rotation_y += 90
    elif key == 'l':
        print("Rotating left face clockwise")
        rotate_left_face(1)
    elif key == 'p':
        print("Rotating left face anticlockwise")
        rotate_left_face(-1)
        # PARENT.rotation_x += 90
    elif key == 'r':
        print("Rotate right face clockwise")
        rotate_right_face(1)
    elif key == 'a':
        print("Rotate right face anticlockwise")
        rotate_right_face(-1)
    elif key == 'u':
        print("Rotating upper face in clockwise direction")
        rotate_up_face(1)
        # PARENT.rotation_y += 90
    elif key == 'y':
        print("Rotating upper face in anticlockwise direction")
        rotate_up_face(-1)
    elif key == 'f':
        print("I am input key F")
        # PARENT.rotation_z += 90
    elif key == 'b':
        print("I am input key B")
        # PARENT.rotation_z += 90



# runnning the app
app.run()
