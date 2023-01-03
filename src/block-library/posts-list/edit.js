import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, QueryControls } from "@wordpress/components";
import { format, dateI18n, getSettings } from "@wordpress/date";
import { RawHTML } from "@wordpress/element";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
	const {
		numberOfPosts,
		displayFeaturedImage,
		order,
		orderBy,
		categories,
	} = attributes;
	const catIDs =
		categories && categories.length > 0 ? categories.map((cat) => cat.id) : [];
	const posts = useSelect(
		(select) => {
			return select("core").getEntityRecords("postType", "post", {
				per_page: numberOfPosts,
				_embed: true,
				order: order,
				orderby: orderBy,
				categories: catIDs,
			});
		},
		[numberOfPosts, order, orderBy, categories]
	);
	const onDisplayFeaturedImageChange = (value) => {
		setAttributes({ displayFeaturedImage: value });
	};
	const onNumberOfItemsChange = (value) => {
		setAttributes({ numberOfPosts: value });
	};

	const onOrderByChange = (value) => {
		setAttributes({ orderBy: value });
	};

	const onOrderChange = (value) => {
		setAttributes({ order: value });
	};
	const allCats = useSelect((select) => {
		return select("core").getEntityRecords("taxonomy", "category", {
			per_page: -1,
		});
	}, []);
	const catSuggestions = {};
	if (allCats) {
		for (let i = 0; i < allCats.length; i++) {
			const cat = allCats[i];
			catSuggestions[cat.name] = cat;
		}
	}

	const onCategoryChange = (values) => {
		const hasNoSuggestions = values.some(
			(value) => typeof value === "string" && !catSuggestions[value]
		);
		if (hasNoSuggestions) return;

		const updatedCats = values.map((token) => {
			return typeof token === "string" ? catSuggestions[token] : token;
		});

		setAttributes({ categories: updatedCats });
	};
	return (
		<>
			<InspectorControls>
				<PanelBody>
					<ToggleControl
						label={__("Display Featured Image", "gt_block")}
						checked={displayFeaturedImage}
						onChange={onDisplayFeaturedImageChange}
					/>
					<QueryControls
						numberOfItems={numberOfPosts}
						onNumberOfItemsChange={onNumberOfItemsChange}
						maxItems={10}
						minItems={1}
						orderBy={orderBy}
						onOrderByChange={onOrderByChange}
						order={order}
						onOrderChange={onOrderChange}
						categorySuggestions={catSuggestions}
						selectedCategories={categories}
						onCategoryChange={onCategoryChange}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				{...useBlockProps({
					className: " eros-blog-list-wrapper two heading-center ",
				})}
			>
				{posts &&
					posts.map((post) => {
						const featuredImage =
							post._embedded &&
							post._embedded["wp:featuredmedia"] &&
							post._embedded["wp:featuredmedia"].length > 0 &&
							post._embedded["wp:featuredmedia"][0];

						return (
							<div className="blog-list-item row" key={post.id}>
								{displayFeaturedImage && featuredImage && (
									<div className="col-md-4">
										<a href={post.link}>
											<img
												src={
													featuredImage.media_details.sizes.eros_small_list_grid
														.source_url
												}
												alt={featuredImage.alt_text}
												className={"wp-image-" + post.id}
											/>
										</a>
									</div>
								)}

								<div
									className={displayFeaturedImage ? "col-md-8" : "col-md-12"}
								>
									<h4 className="title ">
										<a href={post.link}>
											{post.title.rendered ? (
												<RawHTML>{post.title.rendered}</RawHTML>
											) : (
												__("(No title)", "gt_block")
											)}
										</a>
									</h4>

									<ul className="author-meta">
										<li>
											{post.date_gmt && (
												<time dateTime={format("c", post.date_gmt)}>
													{dateI18n(getSettings().formats.date, post.date_gmt)}
												</time>
											)}
										</li>
									</ul>
								</div>
							</div>
						);
					})}
			</div>

			{/* <ul {...useBlockProps()}>
				{posts &&
					posts.map((post) => {
						const featuredImage =
							post._embedded &&
							post._embedded["wp:featuredmedia"] &&
							post._embedded["wp:featuredmedia"].length > 0 &&
							post._embedded["wp:featuredmedia"][0];
						return (
							<li key={post.id}>
								{displayFeaturedImage && featuredImage && (
									<img
										src={
											featuredImage.media_details.sizes.eros_small_list_grid
												.source_url
										}
										alt={featuredImage.alt_text}
									/>
								)}
								<h5>
									<a href={post.link}>
										{post.title.rendered ? (
											<RawHTML>{post.title.rendered}</RawHTML>
										) : (
											__("(No title)", "latest-posts")
										)}
									</a>
								</h5>
								{post.date_gmt && (
									<time dateTime={format("c", post.date_gmt)}>
										{dateI18n(getSettings().formats.date, post.date_gmt)}
									</time>
								)}
								{post.excerpt.rendered && (
									<RawHTML>{post.excerpt.rendered}</RawHTML>
								)}
							</li>
						);
					})}
			</ul> */}
		</>
	);
}
