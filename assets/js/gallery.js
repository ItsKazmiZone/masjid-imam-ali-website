/* ==========================================================================
   Masjid Imam Ali - Gallery Filtering & Lightbox Engine
   Author: Senior Frontend Engineer & UI/UX Designer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilterAndLightbox();
});

function initGalleryFilterAndLightbox() {
  const galleryGrid = document.getElementById('gallery-grid');
  const tabContainer = document.getElementById('gallery-tabs');
  if (!galleryGrid) return;

  const galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
  const tabButtons = tabContainer ? Array.from(tabContainer.querySelectorAll('.tab-btn')) : [];

  let activeFilteredItems = [...galleryItems]; // Stores items matching current filter
  let currentLightboxIndex = 0;

  /* --------------------------------------------------------------------------
     1. Gallery Category Filtering
     -------------------------------------------------------------------------- */
  if (tabContainer) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Toggle active tab class
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        // Filter visible gallery items with elegant transition
        activeFilteredItems = [];

        galleryItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');

          if (filterValue === 'all' || itemCategory === filterValue) {
            item.style.display = 'block';
            // Trigger reflow for animation
            void item.offsetWidth;
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
            activeFilteredItems.push(item);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            // Wait for transition before hiding completely
            setTimeout(() => {
              if (item.style.opacity === '0') {
                item.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Lightbox Creation & Setup
     -------------------------------------------------------------------------- */
  // Create Lightbox DOM dynamically to preserve HTML cleanliness and maintainability
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image Lightbox Viewer');
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">
      <svg class="icon-svg" viewBox="0 0 24 24" width="32" height="32" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
      <svg class="icon-svg" viewBox="0 0 24 24" width="24" height="24" stroke-width="2.5">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="lightbox-nav lightbox-next" aria-label="Next image">
      <svg class="icon-svg" viewBox="0 0 24 24" width="24" height="24" stroke-width="2.5">
        <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="lightbox-content-wrapper">
      <div class="lightbox-img-container">
        <img class="lightbox-img" src="" alt="">
      </div>
      <div class="lightbox-caption">
        <h3 class="lightbox-title"></h3>
        <p class="lightbox-category"></p>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const updateLightboxContent = (index) => {
    if (activeFilteredItems.length === 0) return;
    
    // Bounds wrapping
    if (index < 0) index = activeFilteredItems.length - 1;
    if (index >= activeFilteredItems.length) index = 0;
    
    currentLightboxIndex = index;
    const targetItem = activeFilteredItems[currentLightboxIndex];
    
    const src = targetItem.getAttribute('data-src') || targetItem.querySelector('img').src;
    const title = targetItem.querySelector('.gallery-title')?.textContent || 'Gallery Image';
    const category = targetItem.querySelector('.gallery-tag')?.textContent || '';

    // Load with smooth loading effect
    lightboxImg.style.opacity = '0';
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxCategory.textContent = category;

    lightboxImg.onload = () => {
      lightboxImg.style.opacity = '1';
    };
  };

  const openLightbox = (index) => {
    updateLightboxContent(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scrolling
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
  };

  // Event Listeners for Opening Lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Find the index of this item in the currently active visible filtered items
      const index = activeFilteredItems.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    });
  });

  // Event Listeners for Navigating Lightbox
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => updateLightboxContent(currentLightboxIndex - 1));
  nextBtn.addEventListener('click', () => updateLightboxContent(currentLightboxIndex + 1));

  // Close when clicking outside content (backdrop click)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-container')) {
      closeLightbox();
    }
  });

  // Full accessibility keyboard support (WCAG)
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      updateLightboxContent(currentLightboxIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updateLightboxContent(currentLightboxIndex + 1);
    }
  });
}
