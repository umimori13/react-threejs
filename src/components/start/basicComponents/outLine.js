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
import fs from '../shaders/outline.fs'
import vs from '../shaders/outline.vs'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'

function outLine() {
    const radius = 0.15 * 1
    const rsegments = 20
    const ssegments = 20
    let result1, result2
    {
        const curvePath = new CurvePath()
        const firstPoints = [
            new Vector3(31 / 2, 23, -0.1),
            new Vector3(
                -15 +
                    Math.cos(2 * 0) *
                        (1 + 0.6 * (Math.cos(5 * 0) + 0.75 * Math.cos(10 * 0))),
                18 +
                    Math.sin(2 * 0) *
                        (1 + 0.6 * (Math.cos(5 * 0) + 0.75 * Math.cos(10 * 0))),
                0,
            ),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]
        // points.forEach((val) => {
        //     const linecurve = new LineCurve3(...val)
        //     curvePath.add(linecurve)
        // })
        // console.log('curvePath :>> ', curvePath)

        // DecoratedTorusKnot4a

        function DecoratedTorusKnot4a(scale) {
            Curve.call(this)

            this.scale = scale === undefined ? 40 : scale
        }

        DecoratedTorusKnot4a.prototype = Object.create(Curve.prototype)
        DecoratedTorusKnot4a.prototype.constructor = DecoratedTorusKnot4a

        DecoratedTorusKnot4a.prototype.getPoint = function(t, optionalTarget) {
            var point = optionalTarget || new Vector3()

            t *= Math.PI * 2

            var x =
                Math.cos(2 * t) *
                (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t)))
            var y =
                Math.sin(2 * t) *
                (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t)))
            var z = 0

            return point.set(x, y, z).multiplyScalar(this.scale)
        }

        const decorate = new DecoratedTorusKnot4a(1)
        const firstPath = new CatmullRomCurve3(firstPoints)
        const firstGeometry = new TubeBufferGeometry(
            firstPath,
            rsegments,
            radius,
            ssegments,
        )
        const midGeomtry = new TubeBufferGeometry(
            decorate,
            rsegments,
            radius,
            ssegments,
        )
        midGeomtry.translate(-15, 18, 0.3)

        const secondPoints = [
            new Vector3(
                -15 +
                    Math.cos(2 * 0) *
                        (1 + 0.6 * (Math.cos(5 * 0) + 0.75 * Math.cos(10 * 0))),
                18 +
                    Math.sin(2 * 0) *
                        (1 + 0.6 * (Math.cos(5 * 0) + 0.75 * Math.cos(10 * 0))),
                0,
            ),
            new Vector3(0, 0, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const secondPath = new CatmullRomCurve3(secondPoints)
        const secondGeometry = new TubeBufferGeometry(
            secondPath,
            rsegments,
            radius,
            ssegments,
        )

        const thirdPoints = [
            new Vector3(0, 0, 0),
            new Vector3(0, 20, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const thirdPath = new CatmullRomCurve3(thirdPoints)
        const thirdGeometry = new TubeBufferGeometry(
            thirdPath,
            rsegments,
            radius,
            ssegments,
        )

        const fourPoints = [
            new Vector3(0, 20, 0),
            new Vector3(31, 20, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const fourPath = new CatmullRomCurve3(fourPoints)
        const fourGeometry = new TubeBufferGeometry(
            fourPath,
            rsegments,
            radius,
            ssegments,
        )

        const lastGeometry = BufferGeometryUtils.mergeBufferGeometries([
            firstGeometry,
            midGeomtry,
            secondGeometry,
            thirdGeometry,
            fourGeometry,
        ])
        lastGeometry.setDrawRange(0, 0)
        // lastGeometry.merge(firstGeometry)
        // lastGeometry.merge(midGeomtry)
        // lastGeometry.merge(secondGeometry)

        const color = 0xffffff
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
        const curvePath = new CurvePath()
        const firstPoints = [
            new Vector3(31 / 2, 23, -0.1),
            new Vector3(
                40,
                20 + Math.cos(Math.PI * 2 * 0) + Math.cos(Math.PI * 2 * 0 * 2),
                0,
            ),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]
        // points.forEach((val) => {
        //     const linecurve = new LineCurve3(...val)
        //     curvePath.add(linecurve)
        // })
        // console.log('curvePath :>> ', curvePath)

        // DecoratedTorusKnot4a

        function DecoratedTorusKnot4a(scale) {
            Curve.call(this)

            this.scale = scale === undefined ? 40 : scale
        }

        DecoratedTorusKnot4a.prototype = Object.create(Curve.prototype)
        DecoratedTorusKnot4a.prototype.constructor = DecoratedTorusKnot4a

        DecoratedTorusKnot4a.prototype.getPoint = function(t, optionalTarget) {
            var point = optionalTarget || new Vector3()

            t *= Math.PI * 2

            var x = Math.cos(Math.PI * 2 * t) + Math.cos(Math.PI * 2 * t * 2)
            var y =
                Math.sin(Math.PI * 2 * t) * 2 + Math.sin(Math.PI * 2 * t * 2)
            var z = 0

            return point.set(x, y, z).multiplyScalar(this.scale)
        }

        const decorate = new DecoratedTorusKnot4a(1)
        const firstPath = new CatmullRomCurve3(firstPoints)
        const firstGeometry = new TubeBufferGeometry(
            firstPath,
            rsegments,
            radius,
            ssegments,
        )
        const midGeomtry = new TubeBufferGeometry(
            decorate,
            rsegments,
            radius,
            ssegments,
        )
        midGeomtry.rotateZ(Math.PI / 2)
        midGeomtry.translate(40, 20, 0.3)

        const secondPoints = [
            new Vector3(
                40,
                20 + Math.cos(Math.PI * 2 * 0) + Math.cos(Math.PI * 2 * 0 * 2),
                0,
            ),
            new Vector3(31, 20, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const secondPath = new CatmullRomCurve3(secondPoints)
        const secondGeometry = new TubeBufferGeometry(
            secondPath,
            rsegments,
            radius,
            ssegments,
        )

        const thirdPoints = [
            new Vector3(31, 20, 0),
            new Vector3(31, 0, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const thirdPath = new CatmullRomCurve3(thirdPoints)
        const thirdGeometry = new TubeBufferGeometry(
            thirdPath,
            rsegments,
            radius,
            ssegments,
        )

        const fourPoints = [
            new Vector3(31, 0, 0),
            new Vector3(0, 0, 0),
            // [new Vector3(-15, 15, 0), new Vector3(-20, 10, 0)],
            // [new Vector3(-20, 10, 0), new Vector3(0, 0, 0)],
            // [new Vector3(0, 0, 0), new Vector3(0, 20, 0)],
            // [new Vector3(0, 20, 0), new Vector3(31, 20, 0)],
        ]

        const fourPath = new CatmullRomCurve3(fourPoints)
        const fourGeometry = new TubeBufferGeometry(
            fourPath,
            rsegments,
            radius,
            ssegments,
        )

        const lastGeometry = BufferGeometryUtils.mergeBufferGeometries([
            firstGeometry,
            midGeomtry,
            secondGeometry,
            thirdGeometry,
            fourGeometry,
        ])
        lastGeometry.setDrawRange(0, 0)
        // lastGeometry.merge(firstGeometry)
        // lastGeometry.merge(midGeomtry)
        // lastGeometry.merge(secondGeometry)

        const color = 0xffffff
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
    return [result1, result2]
}

export default outLine
