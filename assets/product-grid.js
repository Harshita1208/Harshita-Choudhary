if (!customElements.get('product-grid-modal')) {
    class ProductGridModal extends HTMLElement {
      constructor() {
        super();
        this.modalContent = null;
        this.closeButton = null;
        this.close = this.close.bind(this);
      }
  
      connectedCallback() {
        this.modalContent = this.querySelector('.product-grid-modalinfo');
        this.closeButton = this.querySelector('.product-grid-modal-toggle');
  
        if (this.closeButton) {
          this.closeButton.addEventListener('click', this.close);
        }
  
        document.addEventListener('click', (event) => {
          if (event.target.closest('.product-icon')) {
            this.openEditPopup(event);
          }
        });
      }
  
      async openEditPopup(event) {
        event.preventDefault();
        const editBtn = event.target.closest('.product-icon');
        if (!editBtn) return;
  
        this.showLoader();
  
        try {
          const editProductUrl = editBtn.dataset.productUrl;
          const response = await fetch(`${editProductUrl}?section_id=product-grid-popup`);
          const htmlText = await response.text();
          const doc = new DOMParser().parseFromString(htmlText, "text/html");
          const content = doc.querySelector('.product-grid-modalinfo');
  
          if (content && this.modalContent) {
            this.modalContent.innerHTML = content.innerHTML;
            this.classList.add('is-active');
            this.setAttribute('open', 'true');
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          this.hideLoader();
        }
      }
  
      showLoader() {
        if (!this.querySelector('.modal-loader')) {
          const loader = document.createElement('div');
          loader.className = 'modal-loader';
          loader.innerHTML = `
            <div class="loader-spinner">
              <svg viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            </div>
          `;
          this.modalContent.appendChild(loader);
        }
        this.querySelector('.modal-loader').classList.add('active');
      }
  
      hideLoader() {
        this.querySelector('.modal-loader')?.classList.remove('active');
      }
  
      close() {
        this.classList.remove("is-active");
        this.removeAttribute('open');
        if (this.modalContent) this.modalContent.innerHTML = "";
      }
    }
  
    customElements.define('product-grid-modal', ProductGridModal);
  }
  