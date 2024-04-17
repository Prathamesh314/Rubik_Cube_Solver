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

PARENT = Entity(model=cube_model, texture='textures/chess_texture.png')
# print(f"{PARENT.position=}")
rotation_y  = 90
cube1 = Entity(parent=PARENT, model=cube_model, texture=cube_texture, position=(1, 1, 1))

def update():
    PARENT.rotation_z += 30*time.dt

# runnning the app
app.run()
