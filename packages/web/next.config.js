/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false, http: false, tty: false, https: false }

    config.module.rules.push({
      test: /\.html/,
      use: [
        {
          loader: 'html-loader'
        }
      ],
    })

    return config
  },
}