// // /** @type {import('next').NextConfig} */
// // const path = require('path');

// // const nextConfig = {
// //   reactStrictMode: true,
// //   webpack: (config) => {
// //     // Fix missing .js extensions in imports
// //     config.resolve.alias['rc-util/es/React/isFragment'] = path.resolve(
// //       __dirname,
// //       'node_modules/rc-util/es/React/isFragment.js'
// //     );
// //     config.resolve.alias['rc-util/es/warning'] = path.resolve(
// //       __dirname,
// //       'node_modules/rc-util/es/warning.js'
// //     );
// //     config.resolve.alias['rc-tree/es/TreeNode'] = path.resolve(
// //       __dirname,
// //       'node_modules/rc-tree/es/TreeNode.js'

// //     );
// //     config.resolve.extensionAlias = {
// //       '.js': ['.js', '.ts', '.tsx'],
// //     };
    
// //     return config;
// //   },
  
// // };



// // module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,

//   transpilePackages: [
//     "rc-util",
//     "rc-tree",
//     "antd" // optional, if you use Ant Design
//   ],

//   webpack: (config) => {
//     // Ensure .js fallback works
//     config.resolve.extensionAlias = {
//       ".js": [".js", ".ts", ".tsx"],
//     };
//     return config;
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Force Next.js to transpile problematic ESM packages
  transpilePackages: [
    "rc-util",
    "rc-tree",
    "rc-table",
    "antd", // include if you use Ant Design
  ],

  webpack: (config) => {
    // Fallback for .js resolution issues
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
};

module.exports = nextConfig;

