import * as THREE from 'three'
import { Object3D, Group, PlaneGeometry, MeshBasicMaterial, Mesh } from 'three'
import particleFS from './shaders/particle.frag'
import particleVS from './shaders/particle.vert'

export default class Particle extends Group {
    constructor(src) {
        super()
        this.init(src)
    }

    init(src) {
        const loader = new THREE.TextureLoader()

        loader.load(src, (texture) => {
            this.texture = texture
            this.texture.minFilter = THREE.LinearFilter
            this.texture.magFilter = THREE.LinearFilter
            this.texture.format = THREE.RGBFormat

            this.width = texture.image.width
            this.height = texture.image.height

            this.initPoints()
        })
    }
    initPoints() {
        this.numPoints = this.width * this.height

        let numVisible = 0
        const threshold = 34
        const highThreshold = 254

        const img = this.texture.image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = this.width
        canvas.height = this.height
        ctx.scale(1, -1)
        ctx.drawImage(img, 0, 0, this.width, this.height * -1)
        // document.body.appendChild(canvas)

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const originalColors = Float32Array.from(imgData.data)
        console.log('originalColors :>> ', originalColors)
        for (let i = 0; i < this.numPoints; i++) {
            if (
                originalColors[i * 4 + 0] > highThreshold &&
                originalColors[i * 4 + 1] > highThreshold &&
                originalColors[i * 4 + 2] > highThreshold
            )
                continue

            if (originalColors[i * 4 + 0] > threshold) numVisible++
        }

        const uniforms = {
            uTime: { value: 0 },
            uRandom: { value: 1.0 },
            uDepth: { value: 2.0 },
            uSize: { value: 0.0 },
            uTextureSize: {
                value: new THREE.Vector2(this.width, this.height),
            },
            uTexture: { value: this.texture },
            uTouch: { value: null },
            moveBuffer: { value: new Float32Array(100 * 3) },
        }

        const material = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: particleVS,
            fragmentShader: particleFS,
            depthTest: false,
            transparent: true,
            // blending: THREE.AdditiveBlending
        })

        const geometry = new THREE.InstancedBufferGeometry()

        // positions
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
        positions.setXYZ(0, -0.5, 0.5, 0.0)
        positions.setXYZ(1, 0.5, 0.5, 0.0)
        positions.setXYZ(2, -0.5, -0.5, 0.0)
        positions.setXYZ(3, 0.5, -0.5, 0.0)
        geometry.setAttribute('position', positions)

        // uvs
        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2)
        uvs.setXYZ(0, 0.0, 0.0)
        uvs.setXYZ(1, 1.0, 0.0)
        uvs.setXYZ(2, 0.0, 1.0)
        uvs.setXYZ(3, 1.0, 1.0)
        geometry.setAttribute('uv', uvs)

        // index
        geometry.setIndex(
            new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1),
        )

        const indices = new Uint16Array(numVisible)
        const offsets = new Float32Array(numVisible * 3)
        const angles = new Float32Array(numVisible)

        for (let i = 0, j = 0; i < this.numPoints; i++) {
            if (
                originalColors[i * 4 + 0] > highThreshold &&
                originalColors[i * 4 + 1] > highThreshold &&
                originalColors[i * 4 + 2] > highThreshold
            )
                continue
            if (originalColors[i * 4 + 0] <= threshold) continue

            offsets[j * 3 + 0] = i % this.width
            offsets[j * 3 + 1] = Math.floor(i / this.width)

            indices[j] = i

            angles[j] = Math.random() * Math.PI

            j++
        }

        geometry.setAttribute(
            'pindex',
            new THREE.InstancedBufferAttribute(indices, 1, false),
        )
        geometry.setAttribute(
            'offset',
            new THREE.InstancedBufferAttribute(offsets, 3, false),
        )
        geometry.setAttribute(
            'angle',
            new THREE.InstancedBufferAttribute(angles, 1, false),
        )
        geometry.computeBoundingBox()
        this.object3D = new THREE.Mesh(geometry, material)
        this.add(this.object3D)
        console.log('this.object3D :>> ', this.object3D)
        const planeGeo = new PlaneGeometry(this.width, this.height)
        const mat = new MeshBasicMaterial({ transparent: true, opacity: 0 })
        const plane = new Mesh(planeGeo, mat)
        this.add(plane)
        const MAX_NUMBER = 100
        const moveBuffer = new Float32Array(MAX_NUMBER * 3)
        console.log('moveBuffer :>> ', moveBuffer)

        this.counter = 0

        const handleMouseMove = (e) => {
            console.log('e :>> ', e.point[0])
            const i =
                e.point[0].uv.x * this.width +
                e.point[0].uv.y * this.height * this.width
            if (
                originalColors[i * 4 + 0] > highThreshold &&
                originalColors[i * 4 + 1] > highThreshold &&
                originalColors[i * 4 + 2] > highThreshold
            ) {
            } else {
                for (let index = 0; index < MAX_NUMBER; index++) {
                    if (moveBuffer[index * 3 + 2] <= 0.0001) {
                        moveBuffer[index * 3] = e.point[0].uv.x
                        moveBuffer[index * 3 + 1] = e.point[0].uv.y
                        moveBuffer[index * 3 + 2] = 1
                        this.counter++
                    }
                }
                this.object3D.material.uniforms.moveBuffer.value = moveBuffer
            }
        }
        plane.addEventListener('mousemove', handleMouseMove)
    }

    update(delta) {
        if (!this.object3D) return

        const buffer = this.object3D.material.uniforms.moveBuffer.value
        for (let index = 0; index < this.counter; index++) {
            if (buffer[index * 3 + 2] >= 0.0001) {
                buffer[index * 3 + 2] -= 0.001
            }
        }
        this.object3D.material.uniforms.uTime.value += delta
    }
}
