class ProductGridModal extends HTMLElement {
  constructor() {
    super();
    this.modalContent = null;
    this.closeButton = null;
    this.cartUpdates = {};
    this.sizeSelected = false;
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

        if (!this.querySelector('.no-variants-marker')) {
          this.initializeColorButtons();
          this.initializeOptions();
        }

        this.initializeCartButtons();
        this.updateVariantID(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.hideLoader();
    }
  }

  initializeColorButtons() {
    this.querySelectorAll('.color-button').forEach(button => {
      button.addEventListener('click', () => {
        const wrapper = button.closest('.color-button-wrapper');
        wrapper.querySelectorAll('.color-button').forEach(btn => {
          btn.classList.remove('selected');
        });
        button.classList.add('selected');
        this.updateVariantID();
      });
    });
  }

  initializeOptions() {
    const customSelects = this.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
      const optionsList = select.querySelector('.options');
      const downArrow = select.querySelector('.select-downarrow');

      select.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsList.classList.toggle('hidden');
        downArrow.classList.toggle('rotated');
      });

      optionsList.querySelectorAll('li:not(.default-option)').forEach(option => {
        option.addEventListener('click', () => {
          select.querySelector('.selected-option').textContent = option.textContent;
          optionsList.classList.add('hidden');
          downArrow.classList.remove('rotated');
          this.sizeSelected = true;

          const sizeReminder = this.querySelector('.size-reminder');
          if (sizeReminder) {
            sizeReminder.style.display = 'none';
          }

          this.updateVariantID();
        });
      });
    });

    document.addEventListener('click', () => {
      customSelects.forEach(select => {
        select.querySelector('.options').classList.add('hidden');
        select.querySelector('.select-downarrow').classList.remove('rotated');
      });
    });
  }

  updateVariantID(initialLoad = false) {
    const variantIdInput = this.querySelector("#selected-variant-id");
    const addToCartBtn = this.querySelector(".product-form_addbtn");

    // if (this.querySelector('.no-variants-marker')) {
    //   if (variantIdInput && addToCartBtn) {
    //     addToCartBtn.disabled = false;
    //     addToCartBtn.textContent = "Add to Cart";
    //   }
    //   return;
    // }

    const colorBtn = this.querySelector('.color-button.selected');
    const sizeSelect = this.querySelector('.custom-select');
    const selectedSizeText = sizeSelect?.querySelector('.selected-option').textContent.trim();

    if (addToCartBtn) {
      if (!colorBtn || !selectedSizeText || selectedSizeText === "Choose your size") {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = "Add To Cart";
      } else {
        const variantString = `${colorBtn.dataset.value}/${selectedSizeText.toLowerCase().replace(/\s+/g, '-')}`;
        let variantId = "";
        let variantInventory = 1;

        this.querySelectorAll(".select-option-hidden option").forEach(option => {
          if (option.value.toLowerCase() === variantString.toLowerCase()) {
            variantId = option.dataset.id;
            variantInventory = parseInt(option.dataset.inventory || "0");
          }
        });

        if (variantIdInput) variantIdInput.value = variantId;
        addToCartBtn.disabled = !variantId || variantInventory <= 0;
        addToCartBtn.textContent = variantInventory <= 0 ? "Sold Out" : "Add to Cart";
      }
    }
  }

  async addToCart() {
    const variantId = this.querySelector("#selected-variant-id")?.value;
    const productId = this.querySelector("#selected-product-id")?.value;
  
    if (!variantId || !productId) {
      this.showSizeError();
      return;
    }
  
    const items = [{ id: variantId, quantity: 1 }];
  
    const colorBtn = this.querySelector('.color-button.selected');
    const sizeSelect = this.querySelector('.custom-select');
  
    if (colorBtn && sizeSelect) {
      const color = colorBtn.textContent.trim().toLowerCase();
      const size = sizeSelect.querySelector('.selected-option').textContent.trim().toLowerCase();
  
      if (color === 'black' && size === 'm') {
        items.push({ id: '51966079762798', quantity: 1 }); // Bonus item
      }
    }
  
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
  
      if (!response.ok) throw new Error(await response.text());
  
      // Optional: You can log or store the returned cart data
      const newCartData = await response.json();
      console.log("Cart update successful:", newCartData);
  
      // Close modal if needed
      this.close();
  
      // ✅ Redirect to cart page
      window.location.href = '/cart';
  
      return newCartData;
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  }
  

  showSizeError() {
    //if (this.querySelector('.no-variants-marker')) return;

    const sizeReminder = this.querySelector('.size-reminder');
    if (sizeReminder) {
      sizeReminder.style.display = 'block';
      setTimeout(() => {
        sizeReminder.style.display = 'none';
      }, 3000);
    }
  }

  initializeCartButtons() {
    this.querySelectorAll('.product-form_addbtn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        this.showLoader();
        await this.addToCart();
        this.hideLoader();
      });
    });
  }

  showLoader() {
    if (!this.querySelector('.modal-loader')) {
      const loader = document.createElement('div');
      loader.className = 'modal-loader';
      loader.innerHTML = '<div class="loader-spinner"></div>';
      this.modalContent.appendChild(loader);
    }
    this.querySelector('.modal-loader').classList.add('active');
  }

  hideLoader() {
    this.querySelector('.modal-loader')?.classList.remove('active');
  }

  close() {
    this.classList.remove('is-active');
    this.removeAttribute('open');
    if (this.modalContent) this.modalContent.innerHTML = '';
  }
}

// ✅ Correct placement — this line must be outside the class
customElements.define('product-grid-modal', ProductGridModal);
