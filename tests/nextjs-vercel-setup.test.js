/**
 * Next.js and Vercel Configuration Tests
 * Tests to ensure Next.js setup and Vercel deployment configuration are correct
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Next.js and Vercel Setup', () => {
  describe('Next.js Configuration', () => {
    it('should have next.config.js with correct export settings', () => {
      const configPath = path.join(process.cwd(), 'next.config.js');
      expect(fs.existsSync(configPath)).toBe(true);
      
      const configContent = fs.readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('output: \'export\'');
      expect(configContent).toContain('trailingSlash: true');
      expect(configContent).toContain('unoptimized: true');
    });

    it('should have pages directory with required files', () => {
      const pagesPath = path.join(process.cwd(), 'pages');
      expect(fs.existsSync(pagesPath)).toBe(true);
      
      const appPath = path.join(pagesPath, '_app.js');
      const indexPath = path.join(pagesPath, 'index.js');
      
      expect(fs.existsSync(appPath)).toBe(true);
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should have Next.js dependencies installed', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.dependencies['next']).toBeDefined();
      expect(packageContent.dependencies['react']).toBeDefined();
      expect(packageContent.dependencies['react-dom']).toBeDefined();
    });
  });

  describe('Vercel Configuration', () => {
    it('should have vercel.json file', () => {
      const vercelPath = path.join(process.cwd(), 'vercel.json');
      expect(fs.existsSync(vercelPath)).toBe(true);
    });

    it('should have correct Vercel configuration for static export', () => {
      const vercelPath = path.join(process.cwd(), 'vercel.json');
      const vercelContent = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
      
      expect(vercelContent.buildCommand).toBe('npm run build');
      expect(vercelContent.outputDirectory).toBe('out');
      // Framework is omitted for static exports to let Vercel auto-detect
      expect(vercelContent.framework).toBeUndefined();
      expect(vercelContent.devCommand).toBe('npm run dev');
      expect(vercelContent.installCommand).toBe('npm install');
    });
  });

  describe('Package.json Scripts', () => {
    it('should have Next.js scripts in package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.scripts['dev']).toBe('next dev');
      expect(packageContent.scripts['build']).toBe('next build');
      expect(packageContent.scripts['start']).toBe('next start');
      expect(packageContent.scripts['lint']).toBe('next lint');
    });

    it('should have Vercel deployment scripts', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.scripts['deploy']).toBe('vercel --prod');
      expect(packageContent.scripts['deploy:preview']).toBe('vercel');
    });

    it('should have Vercel CLI as dependency', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.devDependencies['vercel']).toBeDefined();
    });
  });

  describe('Build Output', () => {
    it('should build successfully and create out directory for static export', async () => {
      // The out directory should exist after running npm run build with static export
      const outPath = path.join(process.cwd(), 'out');
      // We expect this to exist since we run build before tests in CI
      // In actual deployment, Vercel will use the static files from out directory
      expect(fs.existsSync(outPath)).toBe(true);
      
      if (fs.existsSync(outPath)) {
        const indexFile = path.join(outPath, 'index.html');
        expect(fs.existsSync(indexFile)).toBe(true);
      }
    });
  });
});