<?php
/**
 * Plugin Name:       Gutenberg Blocks
 * Description:       All custom gutenberg block build by me
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            armondal
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gt_block
 *
 * @package           gutenberg-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
 *
 */

add_filter( 'gtBlock_block_init', '__return_true' );


function gt_block_block_init() {
	$blocks = array(
			'about-us/'
	);

	foreach($blocks as $block) {
		register_block_type( plugin_dir_path( __FILE__ ) . '/src/block-library/' . $block );
	}
}
add_action( 'init', 'gt_block_block_init' );
