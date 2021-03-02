import React, { useRef, useEffect, useState } from 'react'
import style from './style.module.css'
import json from 'three/examples/fonts/helvetiker_regular.typeface.json'
import Utils from '../../utils/utils'
import {
    AmbientLight,
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    Vector2,
    WebGLRenderer,
    RectAreaLight,
    SphereBufferGeometry,
    sRGBEncoding,
    MeshStandardMaterial,
    Fog,
    Vector3,
    Color,
} from 'three'
import {
    circle,
    door,
    ground,
    wall,
    outLine,
    inLine,
    tunnel,
} from './basicComponents'
import { OrbitControls } from '../../utils/OrbitControls'
import { InputHandler } from '../../utils/inputHandler'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GUI } from 'dat.gui'

import TWEEN, { Tween } from '@tweenjs/tween.js'

import status from './status'

import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

import * as Noise from './perlin'

const InitThree = () => {
    const mount = useRef(null)
    const [isAnimating, setAnimating] = useState(true)
    const controls = useRef(null)

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new Scene()
        const camera = new PerspectiveCamera(75, width / height, 0.5, 500)
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        {
            const geometry = new BoxGeometry(1, 1, 1)
            const material = new MeshStandardMaterial({ color: 0xff00ff })
            const cube = new Mesh(geometry, material)
            scene.add(cube)
        }

        scene.fog = new Fog(0xffffff, 0.1, 1000)

        RectAreaLightUniformsLib.init()
        const [mesh, anoMesh] = door()
        scene.add(mesh, anoMesh)
        const wallMesh = wall()
        scene.add(wallMesh)
        scene.add(ground())
        const theCircle = circle(1)
        theCircle.position.set(31 / 2, 23, 0.1)
        scene.add(theCircle)

        const [theTunnel, tunnelPath, tunnelBackground] = tunnel()
        scene.add(theTunnel)
        scene.add(tunnelBackground)

        renderer.setClearColor('#000000')
        renderer.setSize(width, height)
        renderer.outputEncoding = sRGBEncoding

        const pointLight = new PointLight(0xffffff, 1, 100)
        pointLight.add(
            new Mesh(
                new SphereBufferGeometry(0.25, 16, 8),
                new MeshBasicMaterial({ color: 0xffffff }),
            ),
        )
        // pointLight.position.set(0, 0, 0.1)
        // scene.add(pointLight)

        const rectLight1 = new RectAreaLight(0xffffff, 0, 1, 5)
        rectLight1.lookAt(0, 0, 1)
        rectLight1.position.set(-1, 10, 0.1)
        scene.add(rectLight1)

        const rectLight1Copy = new RectAreaLight(0xffffff, 0, 5, 5)
        rectLight1Copy.position.set(-1, 10, 6.1)
        scene.add(rectLight1Copy)

        const rectLightHelper = new RectAreaLightHelper(rectLight1)
        rectLight1.add(rectLightHelper)

        const rectLight2 = new RectAreaLight(0xffffff, 0, 1, 5)
        rectLight2.lookAt(0, 0, 1)
        rectLight2.position.set(32, 10, 0.1)
        scene.add(rectLight2)

        const rectLight2Copy = new RectAreaLight(0xffffff, 0, 5, 5)
        rectLight2Copy.position.set(32, 10, 6.1)
        scene.add(rectLight2Copy)

        const rectLightHelper2 = new RectAreaLightHelper(rectLight2)
        rectLight2.add(rectLightHelper2)

        const [outline1, outline2] = outLine()
        scene.add(outline1, outline2)

        const [inline1, inline2] = inLine()
        scene.add(inline1, inline2)

        const ambLight = new AmbientLight(0x010101)
        scene.add(ambLight)

        const inputHandler = new InputHandler(
            camera,
            scene,
            renderer.domElement,
        )

        const orbitControls = new OrbitControls(camera, renderer.domElement)
        inputHandler.addInputListener(orbitControls)

        camera.position.set(31 / 2, 13, 25)
        orbitControls.target.set(31 / 2, 13, 0)

        const theRenderScene = new RenderPass(scene, camera)

        const params = {
            exposure: 1,
            bloomStrength: 1,
            bloomThreshold: 0,
            bloomRadius: 1,
        }

        const bloomPass = new UnrealBloomPass(
            new Vector2(width, height),
            1.5,
            0.4,
            0.85,
        )
        bloomPass.threshold = params.bloomThreshold
        bloomPass.strength = params.bloomStrength
        bloomPass.radius = params.bloomRadius

        const composer = new EffectComposer(renderer)
        composer.addPass(theRenderScene)
        composer.addPass(bloomPass)

        const gui = new GUI()

        gui.add(params, 'exposure', 0.1, 2).onChange(function(value) {
            renderer.toneMappingExposure = Math.pow(value, 4.0)
        })

        gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function(value) {
            bloomPass.threshold = Number(value)
        })

        gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function(value) {
            bloomPass.strength = Number(value)
        })

        gui.add(params, 'bloomRadius', 0.0, 1.0)
            .step(0.01)
            .onChange(function(value) {
                bloomPass.radius = Number(value)
            })

        const renderScene = () => {
            renderer.render(scene, camera)
        }

        const handleResize = () => {
            width = mount.current.clientWidth
            height = mount.current.clientHeight
            renderer.setSize(width, height)
            composer.setSize(width, height)

            camera.aspect = width / height
            camera.updateProjectionMatrix()

            composer.render()
            // renderScene()
        }

        let count = 0
        let lightAnimate = false
        let inlineCount = 0
        let percentage = 0

        // Define the precision of the finale tube, the amount of divisions
        const tubeDetail = 500
        // Define the precision of the circles
        const circlesDetail = 10

        // Define the radius of the finale tube
        const radius = 8
        // Get all the circles that will compose the tube
        const frames = tunnelPath.computeFrenetFrames(tubeDetail, true)

        console.log('Noise :>> ', Noise)
        let tunnelTime = 0
        let animateTunnel = true
        let animateDoor = true
        const animate = () => {
            // cube.rotation.x += 0.01
            // cube.rotation.y += 0.01
            frameId = window.requestAnimationFrame(animate)
            // orbitControls.update()
            TWEEN.update()
            // renderScene()
            composer.render()
            rectLightHelper.update()
            rectLightHelper2.update()

            if (status.beginLine) {
                count += 8
                if (outline1) {
                    outline1.geometry.setDrawRange(0, count)
                    outline1.material.uniforms.time.value += 0.01
                }
                if (outline2) {
                    outline2.geometry.setDrawRange(0, count)
                    outline2.material.uniforms.time.value += 0.01
                }
                if (count > 5000 && !lightAnimate) {
                    lightAnimate = true
                    const intensity = { intensity: 0 }
                    new Tween(intensity)
                        .easing(TWEEN.Easing.Bounce.In)
                        .to({ intensity: 1 }, 5000)
                        .onUpdate(() => {
                            rectLight1.intensity = intensity.intensity
                            rectLight1Copy.intensity = intensity.intensity
                            rectLight2.intensity = intensity.intensity
                            rectLight2Copy.intensity = intensity.intensity
                        })
                        .start()
                }
                if (count > 5000) {
                    inlineCount += 10
                    inline1.geometry.setDrawRange(0, inlineCount)
                    inline1.material.uniforms.time.value += 0.01
                    inline1.material.uniforms.color.value.setHSL(
                        (inlineCount % 10000) / 10000,
                        0.8,
                        0.5,
                    )
                    inline2.geometry.setDrawRange(0, inlineCount)
                    inline2.material.uniforms.time.value += 0.01
                    inline2.material.uniforms.color.value.setHSL(
                        (inlineCount % 10000) / 10000,
                        0.8,
                        0.5,
                    )

                    if ((inlineCount > 10000) & animateDoor) {
                        new Tween({ y: 0 })
                            .easing(TWEEN.Easing.Linear.None)
                            .to({ y: 1 }, 5000)
                            .onUpdate(() => {})
                            .start()
                        animateDoor = false
                    }

                    // Create an empty Geometry where we will put the particles
                    tunnelTime += 0.01
                    // First loop through all the circles
                    for (let i = 0; i < tubeDetail; i++) {
                        // Get the normal values for each circle
                        const normal = frames.normals[i]
                        // Get the binormal values
                        const binormal = frames.binormals[i]

                        // Calculate the index of the circle (from 0 to 1)
                        const index = i / tubeDetail
                        // Get the coordinates of the point in the center of the circle
                        const p = tunnelPath.getPointAt(index)

                        // Loop for the amount of particles we want along each circle
                        for (let j = 0; j < circlesDetail; j++) {
                            // Clone the position of the point in the center
                            const position = p.clone()

                            // Calculate the angle for each particle along the circle (from 0 to Pi*2)
                            const angle =
                                i % 2 === 0
                                    ? ((j + tunnelTime + i / 10) /
                                          circlesDetail) *
                                      Math.PI *
                                      2
                                    : ((j - tunnelTime - i / 10) /
                                          circlesDetail) *
                                      Math.PI *
                                      2
                            // Calculate the sine of the angle
                            const sin = Math.sin(angle)
                            // Calculate the cosine from the angle
                            const cos = -Math.cos(angle)

                            // Calculate the normal of each point based on its angle
                            const normalPoint = new Vector3(0, 0, 0)
                            normalPoint.x = cos * normal.x + sin * binormal.x
                            normalPoint.y = cos * normal.y + sin * binormal.y
                            normalPoint.z = cos * normal.z + sin * binormal.z
                            // Multiple the normal by the radius
                            normalPoint.multiplyScalar(radius)

                            // We add the normal values for each point
                            position.add(normalPoint)
                            theTunnel.geometry.vertices[
                                i * circlesDetail + j
                            ].copy(position)

                            const noiseIndex =
                                ((Noise.noise.simplex3(
                                    p.x * 0.04,
                                    p.y * 0.04,
                                    p.z * 0.04,
                                ) +
                                    1 +
                                    tunnelTime / 10) /
                                    2) *
                                360
                            const color = new Color(
                                'hsl(' + noiseIndex + ',80%,50%)',
                            )
                            theTunnel.geometry.colors[
                                i * circlesDetail + j
                            ].set(color)
                        }
                    }
                    theTunnel.geometry.verticesNeedUpdate = true
                    theTunnel.geometry.colorsNeedUpdate = true
                    // if ((percentage < 0.985) & animateTunnel) {
                    //     percentage += 0.001
                    //     // Get the point where the camera should go
                    //     const p1 = tunnelPath.getPointAt(percentage % 1)
                    //     // Get the point where the camera should look at
                    //     const p2 = tunnelPath.getPointAt(
                    //         (percentage + 0.01) % 1,
                    //     )
                    //     camera.position.set(p1.x, p1.y, p1.z)
                    //     camera.lookAt(p2)
                    // } else {
                    //     camera.position.set(500, 500, -500)
                    //     camera.lookAt(500, 500, -1000)
                    // }
                }
                // Increase the percentage
            }
        }

        const start = () => {
            if (!frameId) {
                frameId = requestAnimationFrame(animate)
            }
        }

        const stop = () => {
            cancelAnimationFrame(frameId)
            frameId = null
        }

        mount.current.appendChild(renderer.domElement)
        window.addEventListener('resize', handleResize)
        start()

        controls.current = { start, stop }

        return () => {
            console.log('stop :>> ')
            stop()
            window.removeEventListener('resize', handleResize)
            mount.current.removeChild(renderer.domElement)

            Utils.disposeAll(scene)
            orbitControls.dispose()
            inputHandler.dispose()

            gui.destroy()
            // composer.renderTarget1.dispose()
            // composer.renderTarget2.dispose()
            // scene.remove(cube)
            // geometry.dispose()
            // material.dispose()
        }
    }, [])

    // useEffect(() => {
    //     if (isAnimating) {
    //         controls.current.start()
    //     } else {
    //         controls.current.stop()
    //     }
    // }, [isAnimating])

    return (
        <div
            className={style.Scene}
            ref={mount}
            onClick={() => setAnimating(!isAnimating)}
        />
    )
}

export { InitThree }
