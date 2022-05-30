import P5 from "p5";
import { diffuse, project, advect } from "./Fluid_utils";

export let N = 600;
export let iter = 16;
export let SCALE = 4;
// let t = 0;

// function to use 1D array and fake the extra two dimensions --> 3D
export function IX(x: number, y: number) {
	return x + y * N;
}

export default class Fluid {
	p5: P5;

	size: number;
	dt: number;
	diff: number;
	visc: number;

	s: Array<number>;
	density: Array<number>;

	Vx: Array<number>;
	Vy: Array<number>;

	Vx0: Array<number>;
	Vy0: Array<number>;

	constructor(p5: P5, dt: number, diffusion: number, viscosity: number) {
		this.p5 = p5;

		this.size = N;
		this.dt = dt;
		this.diff = diffusion;
		this.visc = viscosity;

		this.s = new Array(N * N).fill(0);
		this.density = new Array(N * N).fill(0);

		this.Vx = new Array(N * N).fill(0);
		this.Vy = new Array(N * N).fill(0);

		this.Vx0 = new Array(N * N).fill(0);
		this.Vy0 = new Array(N * N).fill(0);
	}

	// step method
	step() {
		let N = this.size;
		let visc = this.visc;
		let diff = this.diff;
		let dt = this.dt;

		let Vx = this.Vx;
		let Vy = this.Vy;

		let Vx0 = this.Vx0;
		let Vy0 = this.Vy0;

		let s = this.s;
		let density = this.density;

		//Diffuse two three velocity components
		diffuse(1, Vx0, Vx, visc, dt, N);
		diffuse(2, Vy0, Vy, visc, dt, N);

		//Fix up velocities so they keep things incompressible
		project(Vx0, Vy0, Vx, Vy);

		//Move the velocities around according to the velocities of the fluid
		advect(1, Vx, Vx0, Vx0, Vy0, dt);
		advect(2, Vy, Vy0, Vx0, Vy0, dt);

		//Fix up the velocities again
		//Diffuse the dye.
		//Move the dye around according to the velocities.
		project(Vx, Vy, Vx0, Vy0);
		diffuse(0, s, density, diff, dt, N);
		advect(0, density, s, Vx, Vy, dt);
	}

	// method to add density
	addDensity(x: number, y: number, amount: number) {
		let index = IX(x, y);
		this.density[index] += amount;
	}

	// method to add velocity
	addVelocity(x: number, y: number, amountX: number, amountY: number) {
		let index = IX(x, y);
		this.Vx[index] += amountX;
		this.Vy[index] += amountY;
	}

	// function to render density
	renderD() {
		for (let i = 0; i < N; i++) {
			for (let j = 0; j < N; j++) {
				let x = i * SCALE;
				let y = j * SCALE;
				let d = this.density[IX(i, j)];
				this.p5.fill(d);
				this.p5.noStroke();
				this.p5.rect(x, y, SCALE, SCALE);
			}
		}
	}

	// function to render velocity
	renderV() {
		for (let i = 0; i < N; i++) {
			for (let j = 0; j < N; j++) {
				let x = i * SCALE;
				let y = j * SCALE;
				let vx = this.Vx[IX(i, j)];
				let vy = this.Vy[IX(i, j)];
				this.p5.stroke(0);

				if (!(this.p5.abs(vx) < 0.1 && this.p5.abs(vy) <= 0.1)) {
					this.p5.line(x, y, x + vx * SCALE, y + vy * SCALE);
				}
			}
		}
	}
}
