import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEOHead({
  title = 'Ito Setia Bhakti - HR Professional & Technology Enthusiast',
  description = 'Experienced HR professional with expertise in talent management, organizational development, and HR technology. Passionate about creating efficient HR systems and developing people.',
  keywords = 'HR professional, talent management, organizational development, human resources, Indonesia, recruitment, training, employee development',
  image = '/api/profile/photo',
  url = '',
  type = 'website',
  author = 'Ito Setia Bhakti',
  publishedTime,
  modifiedTime
}: SEOHeadProps) {
  useEffect(() => {
    // Set basic meta tags
    document.title = title;
    
    // Get or create meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Basic SEO meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    setMetaTag('robots', 'index, follow');

    // Open Graph meta tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url || window.location.href, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:image:alt', title, true);
    setMetaTag('og:site_name', 'Ito Setia Bhakti Portfolio', true);
    setMetaTag('og:locale', 'id_ID', true);

    // Twitter Card meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:image:alt', title);

    // Article specific meta tags
    if (type === 'article') {
      setMetaTag('article:author', author, true);
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
    }

    // JSON-LD Structured Data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'Person',
      ...(type === 'article' ? {
        headline: title,
        description: description,
        image: image,
        author: {
          '@type': 'Person',
          name: author
        },
        publisher: {
          '@type': 'Person',
          name: author
        },
        ...(publishedTime && { datePublished: publishedTime }),
        ...(modifiedTime && { dateModified: modifiedTime })
      } : {
        name: author,
        jobTitle: 'HR Professional & Technology Enthusiast',
        description: description,
        image: image,
        url: url || window.location.href,
        sameAs: [
          'https://linkedin.com/in/ito-setia-bhakti',
          'https://github.com/itosetia',
          'https://instagram.com/ito.setia'
        ],
        worksFor: {
          '@type': 'Organization',
          name: 'Professional Services'
        },
        knowsAbout: ['Human Resources', 'Talent Management', 'Organizational Development', 'HR Technology']
      })
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url || window.location.href;

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);

  return null;
}