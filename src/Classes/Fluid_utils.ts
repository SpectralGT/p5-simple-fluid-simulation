import { N, iter, IX } from "./Fluid";

/*
    Function of solving linear differential equation
    - b : int
    - x : float[]
    - x0 : float[]
    - a : float
    - c : float
    */
function lin_solve(
	b: number,
	x: Array<number>,
	x0: Array<number>,
	a: number,
	c: number
) {
	let cRecip = 1.0 / c;
	for (let t = 0; t < iter; t++) {
		for (let j = 1; j < N - 1; j++) {
			for (let i = 1; i < N - 1; i++) {
				x[IX(i, j)] =
					(x0[IX(i, j)] +
						a *
							(x[IX(i + 1, j)] +
								x[IX(i - 1, j)] +
								x[IX(i, j + 1)] +
								x[IX(i, j - 1)])) *
					cRecip;
			}
		}
		set_bnd(b, x);
	}
}

/*
    Function of dealing with situation with boundary cells.
    - b : int
    - x : float[]
*/
function set_bnd(b: number, x: Array<number>) {
	for (let i = 1; i < N - 1; i++) {
		x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
		x[IX(i, N - 1)] = b == 2 ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
	}
	for (let j = 1; j < N - 1; j++) {
		x[IX(0, j)] = b == 1 ? -x[IX(1, j)] : x[IX(1, j)];
		x[IX(N - 1, j)] = b == 1 ? -x[IX(N - 2, j)] : x[IX(N - 2, j)];
	}

	x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
	x[IX(0, N - 1)] = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
	x[IX(N - 1, 0)] = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
	x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
}

/*
    Function of diffuse
    - b : int
    - x : float[]
    - x0 : float[]
    - diff : float
    - dt : flaot
*/
export function diffuse(
	b: number,
	x: Array<number>,
	x0: Array<number>,
	diff: number,
	dt: number,
	N: number
) {
	let a = dt * diff * (N - 2) * (N - 2);
	lin_solve(b, x, x0, a, 1 + 6 * a);
}

/*
Function of project : This operation runs through all the cells and fixes them up so everything is in equilibrium.
- velocX : float[]
- velocY : float[]
= p : float[]
- div : float[]
*/
export function project(
	velocX: Array<number>,
	velocY: Array<number>,
	p: Array<number>,
	div: Array<number>
) {
	for (let j = 1; j < N - 1; j++) {
		for (let i = 1; i < N - 1; i++) {
			div[IX(i, j)] =
				(-0.5 *
					(velocX[IX(i + 1, j)] -
						velocX[IX(i - 1, j)] +
						velocY[IX(i, j + 1)] -
						velocY[IX(i, j - 1)])) /
				N;
			p[IX(i, j)] = 0;
		}
	}

	set_bnd(0, div);
	set_bnd(0, p);
	lin_solve(0, p, div, 1, 6);

	for (let j = 1; j < N - 1; j++) {
		for (let i = 1; i < N - 1; i++) {
			velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * N;
			velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * N;
		}
	}

	set_bnd(1, velocX);
	set_bnd(2, velocY);
}

/*
    Function of advect: responsible for actually moving things around
    - b : int
    - d : float[]
    - d0 : float[]
    - velocX : float[]
    - velocY : float[]
    - velocZ : float[]
    - dt : float[]
*/
export function advect(
	b: number,
	d: Array<number>,
	d0: Array<number>,
	velocX: Array<number>,
	velocY: Array<number>,
	dt: number
) {
	let i0, i1, j0, j1;

	let dtx = dt * (N - 2);
	let dty = dt * (N - 2);

	let s0, s1, t0, t1;
	let tmp1, tmp2, x, y;

	let Nfloat = N - 2;
	let ifloat, jfloat;
	let i, j;

	for (j = 1, jfloat = 1; j < N - 1; j++, jfloat++) {
		for (i = 1, ifloat = 1; i < N - 1; i++, ifloat++) {
			tmp1 = dtx * velocX[IX(i, j)];
			tmp2 = dty * velocY[IX(i, j)];
			x = ifloat - tmp1;
			y = jfloat - tmp2;

			if (x < 0.5) x = 0.5;
			if (x > Nfloat + 0.5) x = Nfloat + 0.5;
			i0 = Math.floor(x);
			i1 = i0 + 1.0;
			if (y < 0.5) y = 0.5;
			if (y > Nfloat + 0.5) y = Nfloat + 0.5;
			j0 = Math.floor(y);
			j1 = j0 + 1.0;

			s1 = x - i0;
			s0 = 1.0 - s1;
			t1 = y - j0;
			t0 = 1.0 - t1;

			// let i0i = parseInt(i0);
			// let i1i = parseInt(i1);
			// let j0i = parseInt(j0);
			// let j1i = parseInt(j1);

			// RECHECK
			let i0i = i0;
			let i1i = i1;
			let j0i = j0;
			let j1i = j1;

			d[IX(i, j)] =
				s0 * (t0 * d0[IX(i0i, j0i)] + t1 * d0[IX(i0i, j1i)]) +
				s1 * (t0 * d0[IX(i1i, j0i)] + t1 * d0[IX(i1i, j1i)]);
		}
	}

	set_bnd(b, d);
}
