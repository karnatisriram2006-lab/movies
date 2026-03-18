import { Helmet } from "react-helmet-async";

/**
 * SEO Component to manage page metadata.
 * @param {Object} props
 * @param {string} props.title - The page title.
 * @param {string} props.description - The meta description.
 * @param {string} props.image - The social sharing image URL.
 */
export default function SEO({ title, description, image }) {
  const siteTitle = "MoviesWeb";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || "Discover and explore the latest movies and trending titles.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
