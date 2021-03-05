import TWEEN, { Tween } from '@tweenjs/tween.js'
import {
    BufferAttribute,
    BufferGeometry,
    CircleGeometry,
    Color,
    FontLoader,
    Geometry,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    ShaderMaterial,
    TextGeometry,
    Vector3,
} from 'three'
import status from '../status'

import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier'
import chineseJson from '../../../assets/chenweixun-yingxing_Regular.json'
import fs from '../shaders/welcome.fs'
import vs from '../shaders/welcome.vs'

const welcome = () => {
    const loader = new FontLoader()
    const font = loader.parse(chineseJson)

    let geometry = new TextGeometry('欢迎来到', {
        font: font,

        size: 40,
        height: 5,
        curveSegments: 3,

        bevelThickness: 2,
        bevelSize: 1,
        bevelEnabled: true,
    })

    geometry.center()

    const tessellateModifier = new TessellateModifier(8, 6)

    tessellateModifier.modify(geometry)
    console.log('geometry :>> ', geometry)
    geometry = new BufferGeometry().fromGeometry(geometry)

    //

    const numFaces = geometry.attributes.position.count / 3

    const colors = new Float32Array(numFaces * 3 * 3)
    const displacement = new Float32Array(numFaces * 3 * 3)

    const color = new Color()

    for (let f = 0; f < numFaces; f++) {
        const index = 9 * f

        const h = 0.2 * Math.random()
        const s = 0.5 + 0.5 * Math.random()
        const l = 0.5 + 0.5 * Math.random()

        color.setHSL(h, s, l)

        const d = 10 * (0.5 - Math.random())

        for (let i = 0; i < 3; i++) {
            colors[index + 3 * i] = color.r
            colors[index + 3 * i + 1] = color.g
            colors[index + 3 * i + 2] = color.b

            displacement[index + 3 * i] = d
            displacement[index + 3 * i + 1] = d
            displacement[index + 3 * i + 2] = d
        }
    }

    geometry.setAttribute('customColor', new BufferAttribute(colors, 3))
    geometry.setAttribute('displacement', new BufferAttribute(displacement, 3))

    //

    const uniforms = {
        amplitude: { value: 0.0 },
    }

    const shaderMaterial = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vs,
        fragmentShader: fs,
    })

    //

    const mesh = new Mesh(geometry, shaderMaterial)

    return mesh
}
export default welcome
