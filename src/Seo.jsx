import { useEffect } from 'react';

const defaultMeta = {
  title: 'ThinkUp - Plataforma colaborativa de ideas',
  description: 'ThinkUp es una plataforma para compartir, votar y descubrir ideas públicas con inicio de sesión seguro.',
  url: 'https://cool-ideas-beta.vercel.app/',
  image: '',
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
}) => {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', url, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image);
    }
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url);
  }, [title, description, url, image, noIndex]);

  return null;
};

export default Seo;
