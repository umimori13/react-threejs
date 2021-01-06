import {
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    PolyhedronBufferGeometry,
} from 'three'

const door = () => {
    const verticesOfCube = [
        [1, 2, 3],
        [22, 3, 4],
        [2, 3, 4],
    ]

    const indicesOfFaces = [[0, 1, 2]]

    console.log('[verticesOfCube.flat(2)] :>> ', [verticesOfCube.flat(2)])
    const geometry = new PolyhedronBufferGeometry(
        verticesOfCube.flat(2),
        indicesOfFaces.flat(2),
        2,
        1,
    )

    const material = new MeshBasicMaterial({ color: 0xffffff })
    const mesh = new Mesh(geometry, material)
    return mesh
}

export default door
