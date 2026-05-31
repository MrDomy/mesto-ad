// Modal popup controller utility

const handleEscapePress = (event) => {
  if (event.key === 'Escape') {
    const openPopup = document.querySelector('.popup_is-opened');
    if (openPopup) {
      dismissPopup(openPopup);
    }
  }
};

export const showPopup = (popupNode) => {
  popupNode.classList.add('popup_is-opened');
  document.addEventListener('keydown', handleEscapePress);
};

export const dismissPopup = (popupNode) => {
  popupNode.classList.remove('popup_is-opened');
  document.removeEventListener('keydown', handleEscapePress);
};

export const initPopupListeners = (popupNode) => {
  const closeBtn = popupNode.querySelector('.popup__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dismissPopup(popupNode));
  }

  popupNode.addEventListener('mousedown', (e) => {
    if (e.target === popupNode) {
      dismissPopup(popupNode);
    }
  });
};
