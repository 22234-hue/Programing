import type {NextConfig} from 'next';
const nextConfig:NextConfig={outputFileTracingRoot:process.cwd(),poweredByHeader:false,experimental:{serverActions:{bodySizeLimit:'1mb'}},rewrites:async()=>[
  {source:'/favicon.svg',destination:'/assets/brand/mc-logo.svg'},
  {source:'/mn-school.webp',destination:'/assets/images/mn-school.webp'},
],headers:async()=>[{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'SAMEORIGIN'}]}]};
export default nextConfig;
