import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    MirroredRepeatWrapping,
    NearestFilter,
    PolyhedronBufferGeometry,
    RepeatWrapping,
    TextureLoader,
} from 'three'
import jpg from '../../assets/textures/Copper_background.jpg'

const wall = () => {
    const verticesOfCube = [
        [-60, 0],
        [-60, 60],
        [0, 0],
        [0, 20],
        [31, 0],
        [31, 20],
        [81, 0],
        [81, 60],
    ]
    const newVerticesOfCube = []
    verticesOfCube.forEach((val) => {
        newVerticesOfCube.push([...val, 0])
        // newVerticesOfCube.push([...val, -3])
    })

    const indicesOfFaces = [
        [0, 2, 1],
        [1, 2, 3],
        [1, 3, 7],
        [3, 5, 7],
        [7, 5, 4],
        [4, 6, 7],
    ]
    const uvs = [
        [0.0, 0.0],
        [0.0, 1.0],
        [0.425531914893617, 0.0],
        [0.425531914893617, 0.33333],
        [0.6453900709219858, 0.0],
        [0.6453900709219858, 0.33333],
        [1.0, 0.0],
        [1.0, 1.0],
    ]

    console.log('indicesOfFaces :>> ', indicesOfFaces, newVerticesOfCube)
    console.log('[verticesOfCube.flat(2)] :>> ', [verticesOfCube.flat(2)])

    const geometry = new BufferGeometry()
    geometry.setIndex(indicesOfFaces.flat(2))
    geometry.setAttribute(
        'position',
        new Float32BufferAttribute(newVerticesOfCube.flat(2), 3),
    )
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs.flat(2), 2))
    const newNormals = []
    newVerticesOfCube.forEach(() => {
        newNormals.push(0, 0, 1)
    })
    geometry.setAttribute('normal', new Float32BufferAttribute(newNormals, 3))

    console.log('geometry :>> ', geometry)
    const texture = new TextureLoader().load(jpg)
    texture.wrapS = MirroredRepeatWrapping

    texture.magFilter = NearestFilter
    texture.wrapT = MirroredRepeatWrapping
    texture.repeat.set(6, 4)
    const material = new MeshStandardMaterial({
        color: 0xffffff,
        // side: DoubleSide,
        map: texture,
    })
    const mesh = new Mesh(geometry, material)
    mesh.position.z = 0.01

    return mesh
}

export default wall
