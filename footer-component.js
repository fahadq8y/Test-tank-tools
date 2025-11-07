// Footer Component v2.0 - Custom Element
// Unified footer for all Tank Tools pages

class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    console.log('✅ Footer Component v2.0 mounted');
  }

  render() {
    const version = this.getAttribute('version') || '1.0';
    const developer = this.getAttribute('developer') || 'Fahad - 17877';
    const whatsapp = this.getAttribute('whatsapp') || '+965 55222550';
    const additionalText = this.getAttribute('additional-text') || '';

    this.innerHTML = `
      <style>
        footer {
          margin-top: 40px;
          padding: 20px;
          text-align: center;
          color: #ccc;
          font-size: 14px;
          border-top: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
        }

        .whatsapp-link {
          color: #25D366;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .whatsapp-link:hover {
          color: #128C7E;
          text-shadow: 0 0 10px rgba(37, 211, 102, 0.5);
        }

        footer small {
          color: #999;
          font-size: 10px;
          margin-top: 5px;
          display: block;
        }

        @media (max-width: 480px) {
          footer {
            font-size: 12px;
            padding: 15px;
          }

          footer small {
            font-size: 9px;
          }
        }
      </style>

      <footer>
        By <a href="#" class="whatsapp-link" onclick="window.open('https://wa.me/96555222550','_blank'); return false;">${developer}</a> – Version v${version}
        ${additionalText ? `<br>${additionalText}` : ''}
        <br><small>📱 WhatsApp: ${whatsapp}</small>
      </footer>
    `;
  }
}

// Register the custom element
customElements.define('footer-component', FooterComponent);
