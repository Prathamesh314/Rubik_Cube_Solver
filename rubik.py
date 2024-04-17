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
cube1 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 1, 1))



def input(key):
    global PARENT
    if key == 'd':
        print("I am input key D")
        PARENT.rotation_y += 90
    elif key == 'l':
        print("I am input key L")
        PARENT.rotation_x += 90
    elif key == 'r':
        print("I am input key R")
        PARENT.rotation_x += 90
    elif key == 'u':
        print("I am input key U")
        PARENT.rotation_y += 90
    elif key == 'f':
        print("I am input key F")
        PARENT.rotation_z += 90
    elif key == 'b':
        print("I am input key B")
        PARENT.rotation_z += 90


# runnning the app
app.run()
