import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

// Banner for all builds
const banner = `/**
 * OverType v${version}
 * A lightweight markdown editor library with perfect WYSIWYG alignment
 * @license MIT
 * @author Demo User
 * https://github.com/demo/overtype
 */`;

// Base configuration
const baseConfig = {
  bundle: true,
  sourcemap: true,
  target: ['es2020', 'chrome62', 'firefox78', 'safari16'],
  banner: {
    js: banner
  },
  loader: {
    '.js': 'js'
  }
};

// Check for watch mode
const isWatch = process.argv.includes('--watch');

async function build() {
  try {
    // Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');

    if (isWatch) {
      // Development build with watch mode
      const ctx = await esbuild.context({
        ...baseConfig,
        outfile: 'dist/overtype.js',
        format: 'iife',
        globalName: 'OverType',
        footer: {
          js: 'if(typeof module!=="undefined")module.exports=OverType;'
        },
        logLevel: 'info'
      });

      await ctx.watch();
      console.log('✅ Watching for changes...');
    } else {
      // UMD Development Build
      await esbuild.build({
        ...baseConfig,
        entryPoints: ['src/overtype.js'],
        outfile: 'dist/overtype.js',
        format: 'iife',
        globalName: 'OverType'
      });
      console.log('✅ Built dist/overtype.js');

      // UMD Production Build (minified)
      await esbuild.build({
        ...baseConfig,
        entryPoints: ['src/overtype.js'],
        outfile: 'dist/overtype.min.js',
        format: 'iife',
        globalName: 'OverType',
        minify: true,
        sourcemap: false
      });
      console.log('✅ Built dist/overtype.min.js');

      // ESM Build
      await esbuild.build({
        ...baseConfig,
        entryPoints: ['src/overtype.js'],
        outfile: 'dist/overtype.esm.js',
        format: 'esm'
      });
      console.log('✅ Built dist/overtype.esm.js');

      // Report sizes
      const devSize = fs.statSync('dist/overtype.js').size;
      const minSize = fs.statSync('dist/overtype.min.js').size;
      const esmSize = fs.statSync('dist/overtype.esm.js').size;

      console.log('\n📊 Build sizes:');
      console.log(`   Development: ${(devSize / 1024).toFixed(2)} KB`);
      console.log(`   Minified:    ${(minSize / 1024).toFixed(2)} KB`);
      console.log(`   ESM:         ${(esmSize / 1024).toFixed(2)} KB`);
      console.log('\n✨ Build complete!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();