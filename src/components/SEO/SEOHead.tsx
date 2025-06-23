import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "রাহেলা ফ্যাশন এন্ড প্রিন্টিং হাউজ - বাংলাদেশের সেরা কাস্টম পোশাক ও প্রিন্টিং সেবা",
  description = "বাংলাদেশের সেরা কাস্টম পোশাক এবং প্রিন্টিং সেবা। উচ্চ মানের জার্সি, টি-শার্ট, ইউনিফর্ম এবং কাস্টম প্রিন্টিং। দ্রুত ডেলিভারি ও সাশ্রয়ী মূল্যে।",
  keywords = "কাস্টম জার্সি, টি-শার্ট প্রিন্টিং, ইউনিফর্ম তৈরি, লোগো ডিজাইন, বাংলাদেশ, ঢাকা, কাস্টম পোশাক, প্রিন্টিং সেবা",
  image = "https://scontent.fcgp36-1.fna.fbcdn.net/v/t39.30808-6/480273333_1057746109701793_5791664260972046635_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=IvFrvfNeCzQQ7kNvwEo4Ap6&_nc_oc=Adl46Xgt26ecXBh19Ulrgx5urH0PrGVQsSeFC0OFyf3wSukqeDyUBPvIRyg_3qmIP90&_nc_zt=23&_nc_ht=scontent.fcgp36-1.fna&_nc_gid=BjJsFJtlfZUuwoEUMVS_yA&oh=00_AfPIcn-Dx3QWIxlgQ6Elu-R6itTDujN_Ep6OPGUzQroy1Q&oe=685E0907",
  url = "https://rfap.vercel.app/",
  type = "website",
  structuredData,
  noIndex = false
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="রাহেলা ফ্যাশন এন্ড প্রিন্টিং হাউজ" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;