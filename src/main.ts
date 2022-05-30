import P5 from "p5";
import Fluid from "./Classes/Fluid";

const sketch = (p5: P5) => {
	let fluid: Fluid;

	p5.setup = () => {
		const canvas = p5.createCanvas(600, 600);
		canvas.parent("app");
		// p5.frameRate(22);

		fluid = new Fluid(p5, 0.2, 0, 0.0000001);
	};

	p5.draw = () => {
		p5.stroke(51);
		p5.strokeWeight(2);

		if (p5.mouseIsPressed) {

			fluid.addDensity(p5.mouseX-1, p5.mouseY,255);
			fluid.addDensity(p5.mouseX, p5.mouseY,255);
			fluid.addDensity(p5.mouseX+1, p5.mouseY,255);
			fluid.addDensity(p5.mouseX, p5.mouseY-1,255);
			fluid.addDensity(p5.mouseX, p5.mouseY,255);
			fluid.addDensity(p5.mouseX, p5.mouseY+1,255);


			fluid.addVelocity(p5.mouseX, p5.mouseY, 10, 10);
		}

		fluid.step();
		fluid.renderD();

		console.log("success");
	};
};

new P5(sketch);
