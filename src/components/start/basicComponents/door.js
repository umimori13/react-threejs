import {
    BufferGeometry,
    DoubleSide,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PolyhedronBufferGeometry,
    TextureLoader,
} from 'three'
import jpg from '../../../assets/textures/door_background_1.jpg'

const door = () => {
    const verticesOfCube = [
        [0, 0],
        [7, 9],
        [11, 4],
        [13, 10],
        [16, 6],
        [19, 12],
        [23, 7],
        [31, 20],
        [0, 20],
    ]
    const newVerticesOfCube = []
    verticesOfCube.forEach((val) => {
        newVerticesOfCube.push([...val, 0])
        newVerticesOfCube.push([...val, -3])
    })
    const indicesOfFaces = []
    newVerticesOfCube.forEach((val, idx, arr) => {
        const i = idx
        const j = (idx + 1) % arr.length
        const k = (idx + 2) % arr.length
        if (idx % 2 === 0) {
            indicesOfFaces.push([i, j, k])
        } else {
            indicesOfFaces.push([k, j, i])
        }
    })

    indicesOfFaces.push(
        [0, 2, 16],
        [6, 16, 2],
        [6, 2, 4],
        [10, 16, 6],
        [6, 8, 10],
        [10, 12, 14],
        [14, 16, 10],
    )

    const uvs = []
    newVerticesOfCube.forEach((val) => {
        uvs.push(val[0] / 31)
        uvs.push(val[1] / 20)
    })

    console.log('indicesOfFaces :>> ', indicesOfFaces, newVerticesOfCube)
    console.log('[verticesOfCube.flat(2)] :>> ', [verticesOfCube.flat(2)])
    // const geometry = new PolyhedronBufferGeometry(
    //     newVerticesOfCube.flat(2),
    //     indicesOfFaces.flat(2),
    //     2,
    //     1,
    // )
    const normals = []
    newVerticesOfCube.forEach(() => {
        normals.push(0, 0, 1)
    })

    const geometry = new BufferGeometry()
    geometry.setIndex(indicesOfFaces.flat(2))
    geometry.setAttribute(
        'position',
        new Float32BufferAttribute(newVerticesOfCube.flat(2), 3),
    )
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))

    const texture = new TextureLoader().load(jpg)
    const material = new MeshStandardMaterial({
        color: 0xffffff,
        side: DoubleSide,
        map: texture,
    })
    const mesh = new Mesh(geometry, material)

    const newIndicesOfFaces = [...indicesOfFaces].filter((val, idx) => {
        const valString = val.toString()
        if (
            valString === [6, 2, 4].toString() ||
            valString === [6, 8, 10].toString() ||
            valString === [10, 12, 14].toString() ||
            idx > 17
        )
            return false
        else return true
    })
    newIndicesOfFaces.push(
        [0, 2, 4],
        [0, 4, 16],
        [4, 6, 8],
        [4, 8, 16],
        [8, 10, 12],
        [8, 12, 16],
        [16, 12, 14],
    )
    console.log('newIndicesOfFaces :>> ', newIndicesOfFaces)
    const anouvs = []
    const anoVOC = newVerticesOfCube.map((val, idx) => {
        if (idx === 16 || idx === 17) {
            return [31, val[0], val[2]]
        }

        return val
    })
    anoVOC.forEach((val) => {
        anouvs.push(val[0] / 31)
        anouvs.push(val[1] / 20)
    })
    const newGeometry = new BufferGeometry()
    newGeometry.setIndex(newIndicesOfFaces.flat(2))
    newGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(anoVOC.flat(2), 3),
    )
    console.log('newGeometry :>> ', newGeometry)
    console.log('newVerticesOfCube :>> ', newVerticesOfCube)
    newGeometry.setAttribute('uv', new Float32BufferAttribute(anouvs, 2))

    const newNormals = []
    newVerticesOfCube.forEach(() => {
        newNormals.push(0, 0, -1)
    })
    newGeometry.setAttribute(
        'normal',
        new Float32BufferAttribute(newNormals, 3),
    )

    const anotherMesh = new Mesh(newGeometry, material)
    console.log('mesh :>> ', mesh)
    mesh.position.z = -0.1
    anotherMesh.position.z = -0.1
    return [mesh, anotherMesh]
}

export default door
