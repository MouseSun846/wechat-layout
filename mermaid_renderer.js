(async () => {
  const scriptElement = document.currentScript;
  const containerId = scriptElement.dataset.containerId;

  // Import canvg library
  let canvg;
  try {
    // 使用 require 替代 import
    canvg = require('canvg');
  } catch (error) {
    console.error('Failed to import canvg:', error);
    throw new Error('Failed to import canvg library');
  }

  // Function to convert SVG to PNG using canvg library
  async function convertSvgToPng(svgString) {
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on SVG viewBox or size
    const svgMatch = svgString.match(/<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/);
    const viewBoxMatch = svgString.match(/<svg[^>]*viewBox="([\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+)"/);
    
    if (svgMatch) {
      canvas.width = parseFloat(svgMatch[1]);
      canvas.height = parseFloat(svgMatch[2]);
    } else if (viewBoxMatch) {
      const dimensions = viewBoxMatch[1].split(' ').map(parseFloat);
      canvas.width = dimensions[2];
      canvas.height = dimensions[3];
    } else {
      // Default dimensions if none found
      canvas.width = 800;
      canvas.height = 600;
    }
    
    // Use canvg to render SVG to canvas
    const v = canvg.Canvg.fromString(ctx, svgString);
    await v.render();
    
    // Convert canvas to PNG data URL and extract base64
    const pngDataUrl = canvas.toDataURL('image/png');
    return pngDataUrl.replace('data:image/png;base64,', '');
  }

  async function renderMermaid() {
    try {
      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Initialize Mermaid with specific configuration
      mermaid.initialize({ 
        startOnLoad: false,
        flowchart: {
          useMaxWidth: false, // Disable maxWidth calculation that might cause issues
          htmlLabels: false, // Use SVG labels instead of HTML
          curve: 'linear', // Use linear curve to avoid distance calculation issues
        },
        // Add security configuration
        securityLevel: 'strict',
        // Add additional configuration to prevent rendering issues
        maxTextSize: 50000,
      });

      // Select all nodes with the specified container ID
      const container = document.getElementById(containerId);
      const nodes = container ? container.querySelectorAll('.mermaid') : [];
      
      // Check if nodes exist before rendering
      if (nodes.length > 0) {
        // Render mermaid diagrams to images
        for (const node of nodes) {
          try {
            // Render the diagram to SVG
            const {svg} = await mermaid.render('mermaid-diagram-' + Date.now(), node.textContent);
            
            // Create an image element
            const img = document.createElement('img');
            const pngData = await convertSvgToPng(svg);
            img.src = 'data:image/png;base64,' + pngData;
            img.className = 'mermaid-diagram';
            img.style.maxWidth = '100%';
            
            // Replace the original node with the image
            node.replaceWith(img);
          } catch (renderError) {
            console.error('Error rendering mermaid diagram to image:', renderError);
            // If image rendering fails, keep the original HTML rendering
            await mermaid.run({
              nodes: [node]
            });
          }
        }
        
        // Post a success message
        window.postMessage({ type: 'MERMAID_RENDER_COMPLETE', containerId: containerId }, '*');
      } else {
        console.warn('No Mermaid nodes found for container ID:', containerId);
        window.postMessage({ type: 'MERMAID_RENDER_WARNING', message: 'No nodes found', containerId: containerId }, '*');
      }
    } catch (e) {
      // Log the error and stack trace
      console.error('Mermaid rendering error:', e.message);
      console.error('Mermaid error stack:', e.stack);
      
      // Try alternative rendering approach
      try {
        // Fallback: Try rendering with different curve type
        mermaid.initialize({ 
          startOnLoad: false,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'linear' // Fallback to linear curve
          },
          securityLevel: 'strict',
        });
        
        const container = document.getElementById(containerId);
        const nodes = container ? container.querySelectorAll('.mermaid') : [];
        if (nodes.length > 0) {
          await mermaid.run({
            nodes: nodes
          });
          window.postMessage({ type: 'MERMAID_RENDER_COMPLETE', containerId: containerId }, '*');
        } else {
          // Post an error message if fallback also fails
          window.postMessage({ type: 'MERMAID_RENDER_ERROR', error: e.toString(), containerId: containerId }, '*');
        }
      } catch (fallbackError) {
        console.error('Mermaid fallback rendering error:', fallbackError.message);
        // Post an error message
        window.postMessage({ type: 'MERMAID_RENDER_ERROR', error: e.toString() + '; Fallback error: ' + fallbackError.toString(), containerId: containerId }, '*');
      }
    } finally {
      // Remove the script element
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    }
  }

  try {
    if (typeof mermaid !== 'undefined') {
      await renderMermaid();
    } else {
      window.postMessage({ type: 'MERMAID_ERROR', containerId: containerId, error: 'Mermaid library not found' }, '*');
    }
  } catch (e) {
    console.error('Mermaid rendering error:', e);
    console.error('Mermaid error stack:', e.stack);
    window.postMessage({ type: 'MERMAID_ERROR', containerId: containerId, error: e.message }, '*');
  }
})();
