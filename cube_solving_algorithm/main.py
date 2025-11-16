from fastapi import FastAPI
from cube_template import CubeTemplate
from cube import Cube
from pydantic import BaseModel

app = FastAPI()

class CubeInput(BaseModel):
    scrambled_cube: list

@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/solve_cube")
def solve_cube(scrambled_cube: CubeInput):
    c = Cube(scrambled_cube.scrambled_cube)
    ctemplate = CubeTemplate(c)
    ctemplate.run()
    return c.get_moves()
