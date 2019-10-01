export function randomInt(min: number, max: number) {
	return Math.round(min + (Math.random() * (max - min)));
};

export const int = randomInt

export function greyColor(min: number, max: number) {
	min = min || 1;
	max = max || 9;
	const int = randomInt(min, max).toString(16);

	return `#${int}${int}${int}`;
};
export function color (bgColor: string) {
	// Random 24 colors
	// or based on step
	const hue = randomInt(0, 24) / 24;

	const saturation = randomInt(60, 80) / 100;
	const bgLightness = bgColor ? getLightness(bgColor) : 1.0;
	let minLightness;
	let maxLightness;
	if (bgLightness >= 0.5) {
		minLightness = Math.round(bgLightness * 100) - 45;
		maxLightness = Math.round(bgLightness * 100) - 25;
	} else {
		minLightness = Math.round(bgLightness * 100) + 25;
		maxLightness = Math.round(bgLightness * 100) + 45;
	}
	const lightness = randomInt(minLightness, maxLightness) / 100;

	const q = lightness < 0.5 ?
		lightness * (lightness + saturation) :
		lightness + saturation - (lightness * saturation);
	const p = (2 * lightness) - q;

	const r = Math.floor(hue2rgb(p, q, hue + (1 / 3)) * 255);
	const g = Math.floor(hue2rgb(p, q, hue) * 255);
	const b = Math.floor(hue2rgb(p, q, hue - (1 / 3)) * 255);
	/* eslint-disable no-mixed-operators */
	const c = ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1);

	return '#' + c;
};

function getLightness(rgbColor: string) {
	if (rgbColor[0] !== '#') {
		return 1.0; // Invalid color ?
	}
	rgbColor = rgbColor.slice(1);
	if (rgbColor.length === 3) {
		rgbColor = rgbColor[0] + rgbColor[0] +
			rgbColor[1] + rgbColor[1] + rgbColor[2] + rgbColor[2];
	}

	const hexColor = parseInt(rgbColor, 16);
	const r = hexColor >> 16;
	const g = hexColor >> 8 & 255;
	const b = hexColor & 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);

	return (max + min) / (2 * 255);
}

function hue2rgb(p: number, q: number, h: number) {
	h = (h + 1) % 1;
	if (h * 6 < 1) {
		return p + (q - p) * h * 6;
	}
	if (h * 2 < 1) {
		return q;
	}
	if (h * 3 < 2) {
		return p + (q - p) * ((2 / 3) - h) * 6;
	}
	return p;
}