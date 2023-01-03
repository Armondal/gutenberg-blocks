import { __ } from "@wordpress/i18n";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { Icon } from "@wordpress/components";

export default function save({ attributes }) {
	const { details, url, alt, id, socialLinks } = attributes;
	return (
		<div {...useBlockProps.save()}>
			{url && (
				<img src={url} alt={alt} className={id ? `wp-image-${id}` : null} />
			)}

			{details && (
				<RichText.Content
					tagName="p"
					{...useBlockProps.save()}
					value={details}
				/>
			)}

			{socialLinks.length > 0 && (
				<div className="social-links">
					<ul>
						{socialLinks.map((item, index) => {
							return (
								<li key={index} data-icon={item.icon}>
									<a href={item.link}>
										<Icon icon={item.icon} />
									</a>
								</li>
							);
						})}
						<li></li>
					</ul>
				</div>
			)}
		</div>
	);
}
