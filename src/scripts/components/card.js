// Card visual component generator with modified naming structures

export const assembleCardNode = (
  data,
  userId,
  onImageClick,
  onTrashClick,
  onHeartClick,
  onStatsClick
) => {
  const templateElement = document.querySelector('#card-template').content;
  const clone = templateElement.querySelector('.card').cloneNode(true);

  const img = clone.querySelector('.card__image');
  const title = clone.querySelector('.card__title');
  const trashBtn = clone.querySelector('.card-action-icon-remove');
  const heartBtn = clone.querySelector('.card__like-button');
  const counter = clone.querySelector('.card__like-count');
  const infoBtn = clone.querySelector('.card-action-icon-metrics');

  img.src = data.link;
  img.alt = data.name;
  title.textContent = data.name;

  counter.textContent = data.likes ? data.likes.length : 0;

  const isLikedByCurrentUser = data.likes && data.likes.some((item) => item._id === userId);
  if (isLikedByCurrentUser) {
    heartBtn.classList.add('card__like-button_is-active');
  }

  if (data.owner._id !== userId) {
    trashBtn.remove();
  } else {
    trashBtn.addEventListener('click', () => {
      onTrashClick(data._id, clone);
    });
  }

  heartBtn.addEventListener('click', () => {
    onHeartClick(data._id, heartBtn, counter);
  });

  img.addEventListener('click', () => {
    onImageClick(data.name, data.link);
  });

  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      onStatsClick(data._id);
    });
  }

  return clone;
};