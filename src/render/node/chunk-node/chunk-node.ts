import {Shader, SimpleNode, ArrayBufferNative, FrameBuffer, Texture, ArrayBuffer} from "@foxel_fox/glib";
import {gl} from "../../context";
import {mat4} from "gl-matrix";
import {Camera} from "../../camera";
import {OctreeGrid} from "../../../octree/grid";
import {map3D1D} from "../../../octree/util";
import {Chunk, Mesh} from "../../../octree/chunk";
import {Transfer} from "threads/worker";


interface Model {
	vao: WebGLVertexArrayObject
	position: ArrayBufferNative
	matrix: mat4
	vertexCount: number
}

export class ChunkNode {

	shader: Shader;
	frameBuffer!: FrameBuffer;
	models: { [key: number]: Model } = {};
	uploadQueue = [];

	constructor (
		private camera: Camera,
		private grid: OctreeGrid
	) {
		this.shader = new Shader(
			require("./chunk-node.vs.glsl"),
			require("./chunk-node.fs.glsl")
		);
	}

	init(): void {
		const output = new Texture();
		this.frameBuffer = new FrameBuffer([output], false, true);
		this.grid.getNext().then(n => {
			if (n) {
				this.uploadQueue.push(n);
			}
		})
	}

	run() {
		this.render();
	}

	createMeshGPU(chunk: Mesh): Model {
		const vao = gl.createVertexArray() as WebGLVertexArrayObject;
		const position = new ArrayBufferNative(chunk.mesh, 4 * chunk.vertexCount * 2, 3, gl.FLOAT);
		const positionAttribute = this.shader.getAttributeLocation("position");
		const normalAttribute = this.shader.getAttributeLocation("normal");
		const matrix = mat4.create();

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);

		gl.enableVertexAttribArray(positionAttribute);
		gl.vertexAttribPointer(positionAttribute, 3, position.type, position.normalize, 4*3*2 , 0);

		gl.enableVertexAttribArray(normalAttribute);
		gl.vertexAttribPointer(normalAttribute, 3, position.type, position.normalize, 4*3*2, 4*3);

		gl.bindVertexArray(null);

		mat4.fromTranslation(matrix, chunk.id);

		return { vao, position, matrix, vertexCount: chunk.vertexCount };
	}

	upload() {
		if (this.uploadQueue[0]) {
			const chunk = this.uploadQueue.shift();
			const chunkID = map3D1D(chunk.id);

			if (!this.models[chunkID]) {
				this.models[chunkID] = this.createMeshGPU(chunk);
			} else {
				this.models[chunkID].position.updateBuffer(chunk.mesh, 4 * chunk.vertexCount * 2);
				this.models[chunkID].vertexCount = chunk.vertexCount;
			}
			this.grid.meshUploaded(chunkID)
		}
		this.grid.getNext().then(n => {
			if (n) {
				this.uploadQueue.push(n);
			}
		})
	}

	render() {
		this.upload();
		this.frameBuffer.bind();
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shader.program);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		let mvp = mat4.create();
		let model: Model;



		for (const key in this.models) {
			model = this.models[key];

			mat4.identity(mvp);
			mat4.mul(mvp, this.camera.view, model.matrix);
			mat4.mul(mvp, this.camera.perspective, mvp);
			gl.uniformMatrix4fv(this.shader.getUniformLocation("mvp"), false, mvp);

			gl.bindVertexArray(model.vao);
			gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
		}


	}
}