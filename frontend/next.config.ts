import type { NextConfig } from "next";

const repoName = process.env.NEXT_PUBLIC_REPO_NAME ?? "virtual-tryon";
const isGithubPages = process.env.GITHUB_PAGES === "true";
/** username.github.io 저장소는 도메인 루트에 배포된다 */
const isUserPagesSite = repoName.endsWith(".github.io");
const basePath =
  isGithubPages && !isUserPagesSite ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
