import TWEEN, { Tween } from '@tweenjs/tween.js'
import {
    CircleGeometry,
    Geometry,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    Vector3,
} from 'three'

const circle = (radius) => {
    const group = new Group()

    {
        const geometry = new CircleGeometry(radius, 32)
        const material = new MeshBasicMaterial({ color: 0xffffff })
        const circle = new Mesh(geometry, material)
        group.add(circle)
        group.userData.speed = 0
        const tween = new Tween({ x: group.userData.speed })
        circle.addEventListener('mouseup', (e) => {
            if (group.userData.speed >= -1.1415) {
                group.userData.speed -= 0.1
                TWEEN.removeAll()
                const speed = { x: group.userData.speed }
                new Tween(speed)
                    .to({ x: 0 }, 5000)
                    .onUpdate(() => {
                        group.rotation.z += speed.x
                        group.userData.speed = speed.x
                    })
                    .start()
            } else {
                TWEEN.removeAll()
                const speed = { x: group.userData.speed }
                new Tween(speed)
                    .to({ x: group.userData.speed + 0.1 }, 50000)
                    .onUpdate(() => {
                        group.rotation.z += speed.x
                    })
                    .start()
            }
        })
    }
    {
        const geometry = new Geometry()
        geometry.vertices.push(new Vector3(0, radius, 0))
        geometry.vertices.push(new Vector3(0, 0, 0))
        geometry.vertices.push(new Vector3(0, -radius, 0))
        geometry.vertices.push(new Vector3(0, 0, 0))
        geometry.vertices.push(new Vector3(radius, 0, 0))
        geometry.vertices.push(new Vector3(0, 0, 0))
        geometry.vertices.push(new Vector3(-radius, 0, 0))
        geometry.vertices.push(new Vector3(0, 0, 0))
        const material = new LineBasicMaterial({ color: 0x404040 })
        const line = new Line(geometry, material)
        group.add(line)
    }
    return group
}
export default circle
