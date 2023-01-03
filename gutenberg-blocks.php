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

add_filter('gtBlock_block_init', '__return_true');
define('GT_BLOCK_ROOT_URL', plugin_dir_url(__FILE__));
function gt_block_block_init()
{
	// static blocks
	$blocks = [
		'about-us/'
	];

	foreach ($blocks as $block) {
		register_block_type(plugin_dir_path(__FILE__) . '/src/block-library/' . $block);
	}

	// dynamic blocks
	register_block_type(plugin_dir_path(__FILE__) . '/src/block-library/posts-list/', [
		'render_callback' => 'gt_block_posts_list',
	]);
}
add_action('init', 'gt_block_block_init');

function gt_block_posts_list($attributes)
{
	$args = [
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status'    => 'publish',
		'order'          => $attributes['order'],
		'orderby'        => $attributes['orderBy']
	];
    if(isset($attributes['categories'])) {
		$args['category__in'] = array_column($attributes['categories'], 'id');
	}
	$recent_posts = get_posts($args);

	$posts = '<div class="eros-blog-list-wrapper two heading-center">';
	foreach ($recent_posts as $post) {
		$title     = get_the_title($post);
		$title     = $title ? $title : __('(No title)', 'gt_block');
		$permalink = get_permalink($post);
		$excerpt   = get_the_excerpt($post);
		$excerpt   = substr($excerpt, 0, 0) ;

		// get Image
		$img_id      = get_post_thumbnail_id($post) ? get_post_thumbnail_id($post) : false;
		$img_url_val = $img_id ? wp_get_attachment_image_src($img_id, 'eros_small_list_grid', false) : '';
		$img_url     = is_array($img_url_val) && !empty($img_url_val) ? $img_url_val[0] : '';
		$img_alt     = get_post_meta($img_id, '_wp_attachment_image_alt', true);

		$posts = $posts . '<div class="blog-list-item row">';
		$posts = $posts . '<div class="col-md-4">';
		$posts = $posts . '<a href="' . $permalink . '"> <img src="' . $img_url . '" alt="' . $img_alt . '" class="' . 'wp-image-' . $img_id . '"/> </a></div>';
		$posts = $posts . '<div class="col-md-8">';
		$posts = $posts . '<h4 class="title "><a href="' . $permalink . '"> ' . $title . '</a></h4>';
		if ($excerpt) {
			$posts = $posts . '<p class="details"><a href="' . $permalink . '">' . $excerpt . '</a></p>';
		}
		$posts = $posts . '<ul class="author-meta"><li>' . posted_on() . '</li></ul>';
		$posts = $posts . '</div>';

		if ($post !== end($recent_posts)) {
			$posts = $posts . '<img src = "' . GT_BLOCK_ROOT_URL . 'assets/img/line 1.svg" alt="bottom style" class="blog-list-style-bottom"/>';
		}
		$posts = $posts . '</div> ';
	}
	$posts = $posts . '</div> ';

	return $posts;
}

function posted_on()
{
	$time_string = sprintf('<span class="entry-date published updated">%1$s</span>', esc_attr(get_the_date()));
	$time_string = sprintf(
		$time_string,
		esc_attr(get_the_date(DATE_W3C))
	);

	$posted_on = sprintf(
		/* translators: %s: post date. */
		esc_html_x(' %s', 'post date', 'eros-master'),
		'<a href="' . esc_url(get_permalink()) . '" rel="bookmark">' . $time_string . '</a>'
	);

	return '<span class="posted-on">' . $posted_on . '</span>'; // WPCS: XSS OK.
}


// echo dirname(__FILE__);
// die();
