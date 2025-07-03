/**
 * Test to verify the redirect issue described in the problem statement is fixed
 * This test checks that the homepage doesn't redirect to /index.html
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Homepage Redirect Issue', () => {
  it('should not contain redirect to /index.html in pages/index.js', () => {
    const indexPath = path.join(process.cwd(), 'pages', 'index.js');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Check that the problematic redirect is not present
    expect(indexContent).not.toContain("router.push('/index.html')");
    expect(indexContent).not.toContain("window.location.replace('/index.html')");
  });

  it('should not contain setTimeout that redirects to /index.html', () => {
    const indexPath = path.join(process.cwd(), 'pages', 'index.js');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Check that there's no setTimeout with redirect to /index.html
    const hasSetTimeoutWithRedirect = indexContent.includes('setTimeout') && 
      indexContent.includes('/index.html');
    
    expect(hasSetTimeoutWithRedirect).toBe(false);
  });

  it('should have homepage content without redirect logic', () => {
    const indexPath = path.join(process.cwd(), 'pages', 'index.js');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Check that the homepage has content
    expect(indexContent).toContain("Jay's Mobile Wash");
    expect(indexContent).toContain("Premium Mobile Car Detailing");
    expect(indexContent).toContain("Los Angeles & Orange County");
  });

  it('should verify Next.js config has static export enabled', () => {
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // Check that static export is enabled
    expect(configContent).toContain("output: 'export'");
  });
});