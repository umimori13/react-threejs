import {
    Mesh,
    MeshPhongMaterial,
    PlaneBufferGeometry,
    RepeatWrapping,
    sRGBEncoding,
    TextureLoader,
} from 'three'
import jpg from '../../../assets/textures/ground.jpg'

const ground = () => {
    const texture = new TextureLoader().load(jpg)

    texture.repeat.set(20, 10)
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.encoding = sRGBEncoding
    const groundMaterial = new MeshPhongMaterial({
        color: 0xffffff,
        map: texture,
    })
    const mesh = new Mesh(
        new PlaneBufferGeometry(800, 400, 2, 2),
        groundMaterial,
    )
    // mesh.position.y = -5
    mesh.rotation.x = -Math.PI / 2
    return mesh
}

export default ground
