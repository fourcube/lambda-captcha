import { loadSync, PathCommand } from "opentype.js";
import { assert } from "console";
import { ILambdaCaptchaConfig } from "./config";
import { ILambdaCaptcha } from "./captcha";

export function loadFont(path: string) {
  const font = loadSync(path);

  return font;
}

export function renderText(text: string, options: ILambdaCaptchaConfig) {
  const font = loadFont(options.fontPath)
  const len = text.length;
  const spacing = (options.width - 2) / (len + 1);
  
  let i = -1;
  const out = [];

  while (++i < len) {
    const x = spacing * (i + 1);
    const y = options.height / 2;
    const charPath = renderCharacter(text[i], font, Object.assign({ x, y }, options));

    const color = options.textColor || '#000000'
    out.push(`<path fill="${color}" d="${charPath}"/>`);
  }

  return out;
}

function rndPathCmd(cmd: PathCommand) {
	const r = (Math.random() * 0.2) - 0.1;

	switch (cmd.type) {
		case 'M': case 'L':
			cmd.x! += r;
			cmd.y! += r;
			break;
		case 'Q': case 'C':
			cmd.x! += r;
			cmd.y! += r;
			cmd.x1! += r;
			cmd.y1! += r;
			break;
		default:
			// Close path cmd
			break;
	}

	return cmd;
}

type RenderOptions = ILambdaCaptchaConfig & {
  x: number,
  y: number  
}
export function renderCharacter(text: string, font: opentype.Font, opts: RenderOptions) {
  const ch = text[0];
  assert(ch, 'expect a string');
  
	const fontSize = opts.fontSize;
	const fontScale = fontSize / font.unitsPerEm;

	const glyph = font.charToGlyph(ch);
	const width = glyph.advanceWidth ? glyph.advanceWidth * fontScale : 0;
	const left = opts.x - (width / 2);

	const height = (font.ascender + font.descender) * fontScale;
	const top = opts.y + (height / 2);
	const path = glyph.getPath(left, top, fontSize);
	// Randomize path commands
	path.commands.forEach(rndPathCmd);

	const pathData = path.toPathData(2);

	return pathData;
};