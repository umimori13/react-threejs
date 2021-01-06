import {
    LineBasicMaterial,
    Geometry,
    LineSegments,
    Vector3,
    Sphere,
    Ray,
    Vector2,
    Raycaster,
    OrthographicCamera,
    PerspectiveCamera,
    Vector4,
} from 'three'
import { Tween } from '@tweenjs/tween.js'
import TWEEN from '@tweenjs/tween.js'
export class Utils {
    static disposeAll(obj) {
        while (obj.children.length > 0) {
            this.disposeAll(obj.children[0])
            obj.remove(obj.children[0])
        }
        if (obj.geometry) obj.geometry.dispose()

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach((prop) => {
                if (!obj.material[prop]) return
                if (
                    obj.material[prop] !== null &&
                    typeof obj.material[prop].dispose === 'function'
                )
                    obj.material[prop].dispose()
            })
            obj.material.dispose()
        }
    }
    static createGrid(width, length, spacing, color) {
        let material = new LineBasicMaterial({
            color: color || 0x888888,
        })

        let geometry = new Geometry()
        for (let i = 0; i <= length; i++) {
            geometry.vertices.push(
                new Vector3(
                    -(spacing * width) / 2,
                    i * spacing - (spacing * length) / 2,
                    0,
                ),
            )
            geometry.vertices.push(
                new Vector3(
                    +(spacing * width) / 2,
                    i * spacing - (spacing * length) / 2,
                    0,
                ),
            )
        }

        for (let i = 0; i <= width; i++) {
            geometry.vertices.push(
                new Vector3(
                    i * spacing - (spacing * width) / 2,
                    -(spacing * length) / 2,
                    0,
                ),
            )
            geometry.vertices.push(
                new Vector3(
                    i * spacing - (spacing * width) / 2,
                    +(spacing * length) / 2,
                    0,
                ),
            )
        }

        let line = new LineSegments(geometry, material)
        line.receiveShadow = true
        return line
    }
    static move3dCamera(
        camera,
        controls,
        position,
        target,
        animationDuration = 1500,
        callback = () => {},
    ) {
        const easing = TWEEN.Easing.Quartic.Out

        const curPos = camera.position.clone()
        new Tween(curPos)
            .to(position, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                camera.position.copy(curPos)
            })
            .start()

        const curTar = controls.target.clone()
        new Tween(curTar)
            .to(target, animationDuration)
            .easing(easing)
            .onUpdate(() => {
                controls.target.copy(curTar)
            })
            .onComplete(callback)
            .start()
    }
    static zoomTo(camera, node, factor = 1) {
        if (!node.geometry && !node.boundingSphere && !node.boundingBox) {
            return
        }

        if (node.geometry && node.geometry.boundingSphere === null) {
            node.geometry.computeBoundingSphere()
        }

        node.updateMatrixWorld()

        let bs

        if (node.boundingSphere) {
            bs = node.boundingSphere
        } else if (node.geometry && node.geometry.boundingSphere) {
            bs = node.geometry.boundingSphere
        } else {
            bs = node.boundingBox.getBoundingSphere(new Sphere())
        }

        bs = bs.clone().applyMatrix4(node.matrixWorld)
        const radius = bs.radius
        let fovr = (camera.fov * Math.PI) / 180

        if (camera.aspect < 1) {
            fovr = fovr * camera.aspect
        }

        const distanceFactor = Math.abs(radius / Math.sin(fovr / 2)) * factor

        let offset = camera
            .getWorldDirection(new Vector3())
            .multiplyScalar(-distanceFactor)
        camera.position.copy(bs.center.clone().add(offset))
    }
    static changeControls(camera, renderer, controlsBefore, controlsNew) {
        controlsBefore.enabled = false
        controlsBefore.dispose()
        return new controlsNew(camera, renderer.domElement)
    }
    static mouseToRay(mouse, camera, width, height) {
        let normalizedMouse = {
            x: (mouse.x / width) * 2 - 1,
            y: -(mouse.y / height) * 2 + 1,
        }

        let vector = new Vector3(normalizedMouse.x, normalizedMouse.y, 0.5)
        let origin = camera.position.clone()
        vector.unproject(camera)
        let direction = new Vector3().subVectors(vector, origin).normalize()

        let ray = new Ray(origin, direction)

        return ray
    }
    static getIntersection(mouse, camera, renderer, objects = []) {
        if (objects[0] === null) return []
        const nmouse = new Vector2()
        const raycaster = new Raycaster()
        nmouse.x = (mouse.x / renderer.domElement.clientWidth) * 2 - 1
        nmouse.y = -(mouse.y / renderer.domElement.clientHeight) * 2 + 1
        raycaster.setFromCamera(nmouse, camera)
        const intersections = raycaster.intersectObjects(objects)
        return intersections
    }
    static vectorHalf(a, b) {
        return a
            .clone()
            .add(b)
            .divideScalar(2)
    }

    static projectedRadius(
        radius,
        camera,
        distance,
        screenWidth,
        screenHeight,
    ) {
        if (camera instanceof OrthographicCamera) {
            return Utils.projectedRadiusOrtho(
                radius,
                camera.projectionMatrix,
                screenWidth,
                screenHeight,
            )
        } else if (camera instanceof PerspectiveCamera) {
            return Utils.projectedRadiusPerspective(
                radius,
                (camera.fov * Math.PI) / 180,
                distance,
                screenHeight,
            )
        } else {
            throw new Error('invalid parameters')
        }
    }

    static projectedRadiusPerspective(radius, fov, distance, screenHeight) {
        let projFactor = 1 / Math.tan(fov / 2) / distance
        projFactor = (projFactor * screenHeight) / 2

        return radius * projFactor
    }

    static projectedRadiusOrtho(radius, proj, screenWidth, screenHeight) {
        let p1 = new Vector4(0)
        let p2 = new Vector4(radius)

        p1.applyMatrix4(proj)
        p2.applyMatrix4(proj)
        p1 = new Vector3(p1.x, p1.y, p1.z)
        p2 = new Vector3(p2.x, p2.y, p2.z)
        p1.x = (p1.x + 1.0) * 0.5 * screenWidth
        p1.y = (p1.y + 1.0) * 0.5 * screenHeight
        p2.x = (p2.x + 1.0) * 0.5 * screenWidth
        p2.y = (p2.y + 1.0) * 0.5 * screenHeight
        return p1.distanceTo(p2)
    }
}
export default Utils
