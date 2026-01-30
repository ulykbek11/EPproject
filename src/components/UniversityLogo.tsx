import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

interface UniversityLogoProps {
  url?: string | null;
  name: string;
  website?: string | null;
  className?: string;
}

export function UniversityLogo({ url, name, website, className = "w-8 h-8" }: UniversityLogoProps) {
  const getDomain = (site: string) => {
    try {
      let hostname = site;
      if (!site.startsWith('http')) {
        hostname = `https://${site}`;
      }
      const domain = new URL(hostname).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return null;
    }
  };

  const clearbitUrl = website ? `https://logo.clearbit.com/${getDomain(website)}` : null;
  const [imgSrc, setImgSrc] = useState<string | null>(url || clearbitUrl || null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If we have a provided URL, start with that.
    // If no URL provided, try Clearbit immediately.
    // If neither, we'll end up showing fallback (handled by !imgSrc check).
    setImgSrc(url || clearbitUrl || null);
    setHasError(false);
  }, [url, website]);

  const handleError = () => {
    if (imgSrc === url && clearbitUrl && url !== clearbitUrl) {
        // If the primary URL failed, try Clearbit
        setImgSrc(clearbitUrl);
    } else {
        // If Clearbit failed (or was the only option), show fallback
        setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    return <GraduationCap className={`${className} text-primary p-0.5`} />;
  }

  return (
    <img 
      src={imgSrc} 
      alt={name} 
      className={`${className} object-contain`} 
      onError={handleError} 
    />
  );
}
