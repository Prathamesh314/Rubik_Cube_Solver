
import requests

async def test_fn():
    scrambled_cube = [
        # Back
        [
            [6, 2, 3],
            [2, 5, 6],
            [4, 3, 6],
        ],
        # Top
        [[5, 2, 4], [2, 1, 3], [4, 5, 2]],
        # Front
        [[1, 4, 5], [1, 6, 3], [2, 6, 3]],
        # Bottom
        [[5, 1, 6], [1, 3, 5], [1, 1, 6]],
        # Left
        [[3, 5, 5], [6, 2, 5], [2, 4, 1]],
        # Right
        [[3, 4, 1], [6, 4, 4], [2, 3, 4]],
    ]
    url = "http://localhost:8000/solve_cube"
    payload = {"scrambled_cube": scrambled_cube}
    resp = requests.post(url, json=payload)
    print("Status:", resp.status_code)
    print("Response:", resp.json())

import asyncio
asyncio.run(test_fn())