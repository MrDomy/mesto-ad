import { assembleCardNode } from "./components/card.js";
import { showPopup, dismissPopup, initPopupListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { api } from "./components/api.js";

// DOM references grouped in UI namespace
const UI = {
  gallery: document.querySelector(".places__list"),
  editBtn: document.querySelector(".profile__edit-button"),
  addBtn: document.querySelector(".profile__add-button"),
  profile: {
    name: document.querySelector(".profile__title"),
    job: document.querySelector(".profile__description"),
    avatar: document.querySelector(".profile__image")
  },
  popupEdit: {
    self: document.querySelector(".popup_type_edit"),
    form: document.querySelector(".popup_type_edit .popup__form"),
    nameInput: document.querySelector(".popup_type_edit .popup__input_type_name"),
    jobInput: document.querySelector(".popup_type_edit .popup__input_type_description")
  },
  popupAdd: {
    self: document.querySelector(".popup_type_new-card"),
    form: document.querySelector(".popup_type_new-card .popup__form"),
    placeInput: document.querySelector(".popup_type_new-card .popup__input_type_card-name"),
    urlInput: document.querySelector(".popup_type_new-card .popup__input_type_url")
  },
  popupAvatar: {
    self: document.querySelector(".popup_type_edit-avatar"),
    form: document.querySelector(".popup_type_edit-avatar .popup__form"),
    avatarInput: document.querySelector(".popup_type_edit-avatar .popup__input_type_avatar")
  },
  popupImage: {
    self: document.querySelector(".popup_type_image"),
    img: document.querySelector(".popup_type_image .popup__image"),
    caption: document.querySelector(".popup_type_image .popup__caption")
  },
  popupDelete: {
    self: document.querySelector(".popup_type_remove-card"),
    form: document.querySelector(".popup_type_remove-card .popup__form"),
    submitBtn: document.querySelector(".popup_type_remove-card .popup__button")
  },
  popupStats: {
    self: document.querySelector(".popup_type_info"),
    title: document.querySelector(".popup_type_info .popup__title"),
    meta: document.querySelector(".popup_type_info .metrics-panel"),
    likesList: document.querySelector(".popup_type_info .metrics-list"),
    label: document.querySelector(".popup_type_info .metrics-subheader")
  }
};

// Global context variables
let loggedUserId = null;
let pendingDeleteCardId = null;
let pendingDeleteCardNode = null;

// Validation settings config
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

// Button loading state toggler
const toggleLoadingText = (isLoading, button, loadingText = "Сохранение...", normalText = "Сохранить") => {
  button.textContent = isLoading ? loadingText : normalText;
};

// Modal image viewer handler
const openImageViewer = (name, url) => {
  UI.popupImage.img.src = url;
  UI.popupImage.img.alt = name;
  UI.popupImage.caption.textContent = name;
  showPopup(UI.popupImage.self);
};

// Card deletion popup trigger
const triggerTrashPopup = (cardId, cardNode) => {
  pendingDeleteCardId = cardId;
  pendingDeleteCardNode = cardNode;
  showPopup(UI.popupDelete.self);
};

// Like toggle handler
const handleHeartClick = async (cardId, heartBtn, counterNode) => {
  const hasActiveLike = heartBtn.classList.contains("card__like-button_is-active");
  try {
    const data = await api.toggleLike(cardId, hasActiveLike);
    heartBtn.classList.toggle("card__like-button_is-active");
    counterNode.textContent = data.likes ? data.likes.length : 0;
  } catch (err) {
    console.error("Ошибка переключения лайка:", err);
  }
};

// Card creation date parser
const renderCardDate = (isoString) => {
  return new Date(isoString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

// HTML builders for popup stats rows
const makeStatsRow = (title, val) => {
  const root = document.querySelector('#popup-info-definition-template').content;
  const clone = root.cloneNode(true);
  clone.querySelector('.metrics-label').textContent = title;
  clone.querySelector('.metrics-value').textContent = val;
  return clone;
};

const makeLikerBadge = (username) => {
  const root = document.querySelector('#popup-info-user-preview-template').content;
  const clone = root.cloneNode(true);
  clone.querySelector('.metrics-badge').textContent = username;
  return clone;
};

// Click handler for card stats
const openStatsPopup = async (cardId) => {
  try {
    const list = await api.fetchInitialCards();
    const match = list.find((card) => card._id === cardId);
    if (!match) return;

    UI.popupStats.meta.innerHTML = '';
    UI.popupStats.likesList.innerHTML = '';

    UI.popupStats.title.textContent = match.name;
    UI.popupStats.meta.append(makeStatsRow("Дата создания:", renderCardDate(match.createdAt)));
    UI.popupStats.meta.append(makeStatsRow("Количество лайков:", match.likes ? match.likes.length : 0));

    UI.popupStats.label.textContent = "Лайкнули:";

    if (!match.likes || match.likes.length === 0) {
      const placeholder = document.createElement('li');
      placeholder.textContent = "Нет лайков";
      placeholder.style.color = "#aaa";
      UI.popupStats.likesList.append(placeholder);
    } else {
      match.likes.forEach((user) => UI.popupStats.likesList.append(makeLikerBadge(user.name)));
    }

    showPopup(UI.popupStats.self);
  } catch (err) {
    console.error("Ошибка при получении деталей карточки:", err);
  }
};

// Form submittals
const submitEditProfile = async (e) => {
  e.preventDefault();
  const btn = UI.popupEdit.form.querySelector(validationConfig.submitButtonSelector);
  toggleLoadingText(true, btn);
  try {
    const res = await api.updateUserProfile(UI.popupEdit.nameInput.value, UI.popupEdit.jobInput.value);
    UI.profile.name.textContent = res.name;
    UI.profile.job.textContent = res.about;
    dismissPopup(UI.popupEdit.self);
  } catch (err) {
    console.error("Ошибка при сохранении профиля:", err);
  } finally {
    toggleLoadingText(false, btn);
  }
};

const submitAvatar = async (e) => {
  e.preventDefault();
  const btn = UI.popupAvatar.form.querySelector(validationConfig.submitButtonSelector);
  toggleLoadingText(true, btn);
  try {
    const res = await api.updateUserAvatar(UI.popupAvatar.avatarInput.value);
    UI.profile.avatar.style.backgroundImage = `url('${res.avatar}')`;
    dismissPopup(UI.popupAvatar.self);
  } catch (err) {
    console.error("Ошибка при обновлении аватара:", err);
  } finally {
    toggleLoadingText(false, btn);
  }
};

const submitNewCard = async (e) => {
  e.preventDefault();
  const btn = UI.popupAdd.form.querySelector(validationConfig.submitButtonSelector);
  toggleLoadingText(true, btn, "Создание...", "Создать");
  try {
    const res = await api.publishNewCard(UI.popupAdd.placeInput.value, UI.popupAdd.urlInput.value);
    const card = assembleCardNode(
      res,
      loggedUserId,
      openImageViewer,
      triggerTrashPopup,
      handleHeartClick,
      openStatsPopup
    );
    UI.gallery.prepend(card);
    dismissPopup(UI.popupAdd.self);
    UI.popupAdd.form.reset();
  } catch (err) {
    console.error("Ошибка при добавлении места:", err);
  } finally {
    toggleLoadingText(false, btn, "Создание...", "Создать");
  }
};

const submitTrashConfirm = async (e) => {
  e.preventDefault();
  if (!pendingDeleteCardId || !pendingDeleteCardNode) return;
  toggleLoadingText(true, UI.popupDelete.submitBtn, "Удаление...", "Да");
  try {
    await api.removeCard(pendingDeleteCardId);
    pendingDeleteCardNode.remove();
    dismissPopup(UI.popupDelete.self);
    pendingDeleteCardId = null;
    pendingDeleteCardNode = null;
  } catch (err) {
    console.error("Ошибка при удалении карточки:", err);
  } finally {
    toggleLoadingText(false, UI.popupDelete.submitBtn, "Удаление...", "Да");
  }
};

// Event triggers
UI.editBtn.addEventListener("click", () => {
  UI.popupEdit.nameInput.value = UI.profile.name.textContent;
  UI.popupEdit.jobInput.value = UI.profile.job.textContent;
  clearValidation(UI.popupEdit.form, validationConfig);
  showPopup(UI.popupEdit.self);
});

UI.profile.avatar.addEventListener("click", () => {
  UI.popupAvatar.form.reset();
  clearValidation(UI.popupAvatar.form, validationConfig);
  showPopup(UI.popupAvatar.self);
});

UI.addBtn.addEventListener("click", () => {
  UI.popupAdd.form.reset();
  clearValidation(UI.popupAdd.form, validationConfig);
  showPopup(UI.popupAdd.self);
});

UI.popupEdit.form.addEventListener("submit", submitEditProfile);
UI.popupAvatar.form.addEventListener("submit", submitAvatar);
UI.popupAdd.form.addEventListener("submit", submitNewCard);
UI.popupDelete.form.addEventListener("submit", submitTrashConfirm);

// Configure popup close handlers
const popups = document.querySelectorAll(".popup");
popups.forEach((node) => initPopupListeners(node));

// Enable page validation
enableValidation(validationConfig);

// Startup fetch execution
const initializeApp = async () => {
  try {
    const [profile, initialCards] = await Promise.all([
      api.fetchUserProfile(),
      api.fetchInitialCards()
    ]);

    loggedUserId = profile._id;
    UI.profile.name.textContent = profile.name;
    UI.profile.job.textContent = profile.about;
    UI.profile.avatar.style.backgroundImage = `url('${profile.avatar}')`;

    initialCards.forEach((item) => {
      const card = assembleCardNode(
        item,
        loggedUserId,
        openImageViewer,
        triggerTrashPopup,
        handleHeartClick,
        openStatsPopup
      );
      UI.gallery.append(card);
    });
  } catch (err) {
    console.error("Ошибка инициализации приложения:", err);
  }
};

initializeApp();