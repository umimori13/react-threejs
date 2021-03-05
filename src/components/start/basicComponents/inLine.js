import {
    AdditiveBlending,
    BufferGeometry,
    CatmullRomCurve3,
    Color,
    CurvePath,
    LineCurve3,
    Mesh,
    ShaderMaterial,
    TubeBufferGeometry,
    Vector3,
    Curve,
} from 'three'
import { Curves } from 'three/examples/jsm/curves/CurveExtras'
import fs from '../shaders/inline.fs'
import vs from '../shaders/outline.vs'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'

const inLine = () => {
    const radius = 0.15 * 1
    const rsegments = 20
    const ssegments = 20
    let result1, result2
    {
        const geomeytries = []
        const pushGeometry = (points) => {
            const path = new CatmullRomCurve3(points)
            const geometry = new TubeBufferGeometry(
                path,
                rsegments,
                radius,
                ssegments,
            )
            geomeytries.push(geometry)
        }
        pushGeometry([new Vector3(0, 0, 0), new Vector3(7, 9, 0)])
        pushGeometry([new Vector3(7, 9, 0), new Vector3(11, 4, 0)])
        pushGeometry([new Vector3(11, 4, 0), new Vector3(13, 10, 0)])
        pushGeometry([new Vector3(13, 10, 0), new Vector3(14.5, 8, 0)])

        const lastGeometry = BufferGeometryUtils.mergeBufferGeometries(
            geomeytries,
        )
        const color = 0xff0000
        const shaderMaterial = new ShaderMaterial({
            uniforms: {
                time: {
                    type: 'f',
                    value: 0.0,
                },
                color: {
                    type: 'v3',
                    value: new Color(color),
                },
            },
            vertexShader: vs,
            fragmentShader: fs,
            transparent: true,
            blending: AdditiveBlending,
        })
        const mesh = new Mesh(lastGeometry, shaderMaterial)
        result1 = mesh
    }
    {
        const geomeytries = []
        const pushGeometry = (points) => {
            const path = new CatmullRomCurve3(points)
            const geometry = new TubeBufferGeometry(
                path,
                rsegments,
                radius,
                ssegments,
            )
            geomeytries.push(geometry)
        }
        pushGeometry([new Vector3(31, 20, 0), new Vector3(23, 7, 0)])
        pushGeometry([new Vector3(23, 7, 0), new Vector3(19, 12, 0)])
        pushGeometry([new Vector3(19, 12, 0), new Vector3(16, 6, 0)])
        pushGeometry([new Vector3(16, 6, 0), new Vector3(14.5, 8, 0)])

        const lastGeometry = BufferGeometryUtils.mergeBufferGeometries(
            geomeytries,
        )
        const color = 0xff0000
        const shaderMaterial = new ShaderMaterial({
            uniforms: {
                time: {
                    type: 'f',
                    value: 0.0,
                },
                color: {
                    type: 'v3',
                    value: new Color(color),
                },
            },
            vertexShader: vs,
            fragmentShader: fs,
            transparent: true,
            blending: AdditiveBlending,
        })
        const mesh = new Mesh(lastGeometry, shaderMaterial)
        result2 = mesh
    }
    result1.geometry.setDrawRange(0, 0)
    result2.geometry.setDrawRange(0, 0)
    result1.position.z = -0.1
    result2.position.z = -0.1

    return [result1, result2]
}

export default inLine
