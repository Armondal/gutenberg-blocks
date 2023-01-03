import { registerBlockType } from "@wordpress/blocks";

import "./style.scss";
import edit from "./edit";
import save from "./save";
import metadata from "./block.json";

const { name, attributes } = metadata;

registerBlockType(name, {
	edit,
	save,
});
