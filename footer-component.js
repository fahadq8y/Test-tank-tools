// Footer Component v1.0
// Unified footer for all Tank Tools pages

class FooterComponent {
  constructor(config) {
    this.config = {
      version: config.version || '1.0',
      developer: config.developer || 'Fahad - 17877',
      whatsapp: config.whatsapp || '+965 55222550',
      additionalText: config.additionalText || ''
    };
  }
  
  render() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
      By <a href="#" class="whatsapp-link" onclick="window.open('https://wa.me/96555222550','_blank'); return false;">${this.config.developer}</a> – Version v${this.config.version}
      ${this.config.additionalText ? `<br>${this.config.additionalText}` : ''}
      <br><small style="color:#999;font-size:10px;margin-top:5px;display:block">📱 WhatsApp: ${this.config.whatsapp}</small>
    `;
    
    return footer;
  }
  
  mount(targetSelector = 'body') {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.error('Footer mount target not found:', targetSelector);
      return;
    }
    
    const footer = this.render();
    target.appendChild(footer);
    
    console.log('✅ Footer Component v1.0 mounted');
  }
}

// Export for use
window.FooterComponent = FooterComponent;
