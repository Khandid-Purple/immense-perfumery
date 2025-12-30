import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  url?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop', 
  type = 'website',
  url = window.location.href,
  schema
}) => {
  
  useEffect(() => {
    // 1. Update Title
    const siteTitle = "Immense Perfumery";
    document.title = title === siteTitle ? title : `${title} | ${siteTitle}`;

    // 2. Update Meta Tags
    const updateMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // Open Graph / Facebook / WhatsApp
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:type', type);
    updateMeta('og:url', url);
    updateMeta('og:site_name', siteTitle);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // 3. Inject JSON-LD Schema (Structured Data)
    if (schema) {
      let script = document.getElementById('json-ld-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    // Cleanup function not strictly necessary for meta tags in a simple SPA 
    // as they get overwritten by the next page, but good practice to consider.
  }, [title, description, image, type, url, schema]);

  return null;
};
