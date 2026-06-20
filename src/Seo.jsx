import { useEffect } from 'react';

const defaultMeta = {
  title: 'ThinkUp - Plataforma colaborativa de ideas',
  description: 'ThinkUp es una plataforma para compartir, votar y descubrir ideas públicas con inicio de sesión seguro.',
  url: 'https://cool-ideas-beta.vercel.app/',
  image: null, // No default image yet to avoid 404s
};

function setMeta(name, value, attr = 'name') {
  if (!value) {
    const existing = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (existing) document.head.removeChild(existing);
    return;
  }

  let element = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

const Seo = ({
  title = defaultMeta.title,
  description = defaultMeta.description,
  url = defaultMeta.url,
  image = defaultMeta.image,
  noIndex = false,
  type = 'website',
  schema = null,
  lang = 'es',
}) => {
  useEffect(() => {
    document.title = title;
    document.documentElement.lang = lang;

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:site_name', 'ThinkUp', 'property');

    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');

    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image);
    }

    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);

    // Handle JSON-LD Schema
    let script = document.getElementById('json-ld-schema');
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    } else if (script) {
      document.head.removeChild(script);
    }

    return () => {
      // Optional cleanup if needed when component unmounts
    };
  }, [title, description, url, image, noIndex, type, schema, lang]);

  return null;
};

export default Seo;
