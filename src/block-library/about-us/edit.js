import { __ } from "@wordpress/i18n";
import { useEffect, useState, useRef } from "@wordpress/element";
import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
} from "@wordpress/block-editor";
import { isBlobURL, revokeBlobURL } from "@wordpress/blob";
import { usePrevious } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import {
	Spinner,
	withNotices,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	SelectControl,
	Icon,
	Tooltip,
	TextControl,
	Button,
} from "@wordpress/components";
import {
	DndContext,
	useSensor,
	useSensors,
	PointerSensor,
} from "@dnd-kit/core";
import {
	SortableContext,
	horizontalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import SortableItem from "./sortable-item";
import "./editor.scss";

function Edit({
	attributes,
	setAttributes,
	noticeOperations,
	noticeUI,
	isSelected,
}) {
	const { details, url, alt, id, socialLinks } = attributes;
	const onSelectImage = (image) => {
		if (!image || !image.url) {
			setAttributes({ url: undefined, id: undefined, alt: "" });
			return;
		}
		setAttributes({ url: image.url, id: image.id, alt: image.alt });
	};
	const titleRef = useRef();
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		})
	);
	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			const oldIndex = socialLinks.findIndex(
				(i) => active.id === `${i.icon}-${i.link}`
			);
			const newIndex = socialLinks.findIndex(
				(i) => over.id === `${i.icon}-${i.link}`
			);
			setAttributes({
				socialLinks: arrayMove(socialLinks, oldIndex, newIndex),
			});
			setSelectedLink(newIndex);
		}
	};
	const onSelectURL = (newURL) => {
		setAttributes({
			url: newURL,
			id: undefined,
			alt: "",
		});
	};
	const prevURL = usePrevious(url);
	const prevIsSelected = usePrevious(isSelected);
	const imageObject = useSelect(
		(select) => {
			const { getMedia } = select("core");
			return id ? getMedia(id) : null;
		},
		[id]
	);

	const getImageSizeOptions = () => {
		if (!imageObject) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;
		for (const key in sizes) {
			const size = sizes[key];
			options.push({
				label: key,
				value: size.source_url,
			});
		}
		return options;
	};

	const onUploadError = (message) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	};
	const onChangeAlt = (newAlt) => {
		setAttributes({ alt: newAlt });
	};
	const [blobURL, setBlobURL] = useState();
	const [selectedLink, setSelectedLink] = useState();

	useEffect(() => {
		if (!id && isBlobURL(url)) {
			setAttributes({ url: undefined, alt: "" });
		}
	}, []);

	useEffect(() => {
		{
			url && !prevURL && titleRef.current.focus();
		}
	}, [url, prevURL]);

	useEffect(() => {
		if (isBlobURL(url)) {
			setBlobURL(url);
		} else {
			revokeBlobURL(blobURL);
			setBlobURL();
		}
	}, [url]);

	useEffect(() => {
		{
			!isSelected && prevIsSelected && setSelectedLink();
		}
	}, [isSelected, prevIsSelected]);

	const removeImage = () => {
		setAttributes({
			url: undefined,
			alt: "",
			id: undefined,
		});
	};

	const onChangeImageSize = (newURL) => {
		setAttributes({ url: newURL });
	};

	const addNewSocialItem = () => {
		setAttributes({
			socialLinks: [...socialLinks, { icon: "wordpress", link: "#" }],
		});
		setSelectedLink(socialLinks.length);
	};

	const updateSocialItem = (type, value) => {
		const socialLinksCopy = [...socialLinks];
		socialLinksCopy[selectedLink][type] = value;
		setAttributes({ socialLinks: socialLinksCopy });
	};

	const removeSocialItem = () => {
		setAttributes({
			socialLinks: [
				...socialLinks.slice(0, selectedLink),
				...socialLinks.slice(selectedLink + 1),
			],
		});
		setSelectedLink();
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Image Settings", "gt_block")}>
					{id && (
						<SelectControl
							label={__("Image Size", "gt_block")}
							options={getImageSizeOptions()}
							value={url}
							onChange={onChangeImageSize}
						/>
					)}
					{url && !isBlobURL(url) && (
						<TextareaControl
							label={__("Alt Text", "gt_block")}
							value={alt}
							onChange={onChangeAlt}
							help={__(
								"Alternative text describes your image to people can't see load the image.",
								"gt_block"
							)}
						/>
					)}
					{id && <SelectControl label={__("Image Size", "gt_block")} />}
				</PanelBody>
			</InspectorControls>

			{url && (
				<BlockControls group="inline">
					<MediaReplaceFlow
						allowedTypes={["image"]}
						accept="image/*"
						multiple={false}
						onSelect={onSelectImage}
						onSelectURL={onSelectURL}
						onError={onUploadError}
						mediaId={id}
						name={__("Replace Image", "gt_block")}
						mediaURL={url}
					/>
					<ToolbarButton onClick={removeImage}>
						{__("Remove Image", "gt_block")}
					</ToolbarButton>
				</BlockControls>
			)}
			<div {...useBlockProps()}>
				{url && (
					<div
						className={`wp-block-about-us-logo ${
							isBlobURL(url) ? "is-loading" : ""
						}`}
					>
						<img src={url} alt={alt} />
						{isBlobURL(url) && <Spinner />}
					</div>
				)}
				<MediaPlaceholder
					icon="media-default"
					labels={{ title: __("Logo", "gt_block") }}
					allowedTypes={["image"]}
					accept="image/*"
					multiple={false}
					onSelect={onSelectImage}
					onSelectURL={onSelectURL}
					onError={onUploadError}
					disableMediaButtons={url}
					notices={noticeUI}
				/>
				<RichText
					ref={titleRef}
					placeholder={__("Details", "gt_block")}
					tagName="p"
					onChange={(value) => setAttributes({ details: value })}
					value={details}
					allowedFormats={[]}
				/>
				<div className="social-links">
					<ul>
						<DndContext
							sensors={sensors}
							onDragEnd={handleDragEnd}
							modifiers={[restrictToHorizontalAxis]}
						>
							<SortableContext
								items={socialLinks.map((item) => `${item.icon}-${item.link}`)}
								strategy={horizontalListSortingStrategy}
							>
								{socialLinks.map((item, index) => {
									return (
										<SortableItem
											key={`${item.icon}-${item.link}`}
											id={`${item.icon}-${item.link}`}
											index={index}
											selectedLink={selectedLink}
											setSelectedLink={setSelectedLink}
											icon={item.icon}
										/>
									);
								})}
							</SortableContext>
						</DndContext>

						{isSelected && (
							<li className="add-social-item">
								<Tooltip text={__("Add Social Link", "gt_block")}>
									<button
										aria-label={__("Add Social Link", "gt_block")}
										onClick={addNewSocialItem}
									>
										<Icon icon="plus" />
									</button>
								</Tooltip>
							</li>
						)}
					</ul>
				</div>
				{selectedLink !== undefined && (
					<div className="social-link-form">
						<TextControl
							label={__("Icon", "gt_block")}
							value={socialLinks[selectedLink].icon}
							onChange={(icon) => {
								updateSocialItem("icon", icon);
							}}
						/>
						<TextControl
							label={__("URL", "gt_block")}
							value={socialLinks[selectedLink].link}
							onChange={(link) => {
								updateSocialItem("link", link);
							}}
						/>
						<br />
						<Button isDestructive onClick={removeSocialItem}>
							{__("Remove Link", "gt_block")}
						</Button>
					</div>
				)}
			</div>
		</>
	);
}

export default withNotices(Edit);
