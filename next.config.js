/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /(?:^|\/)(?:AGENTS|CLAUDE)\.md$/,
      use: [
        {
          loader: require.resolve('./loaders/agent-doc-page-loader.js'),
        },
      ],
    })

    return config
  },
}

module.exports = nextConfig
