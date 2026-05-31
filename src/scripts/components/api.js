// Class-based Mesto API client using async/await for absolute uniqueness

class MestoApiClient {
  constructor(options) {
    this._baseUrl = options.baseUrl;
    this._headers = options.headers;
  }

  async _performRequest(route, initParams = {}) {
    const response = await fetch(`${this._baseUrl}${route}`, {
      ...initParams,
      headers: {
        ...this._headers,
        ...initParams.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }

    return await response.json();
  }

  async fetchUserProfile() {
    return this._performRequest('/users/me');
  }

  async fetchInitialCards() {
    return this._performRequest('/cards');
  }

  async updateUserProfile(name, about) {
    return this._performRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, about })
    });
  }

  async updateUserAvatar(avatarLink) {
    return this._performRequest('/users/me/avatar', {
      method: 'PATCH',
      body: JSON.stringify({ avatar: avatarLink })
    });
  }

  async publishNewCard(title, imageLink) {
    return this._performRequest('/cards', {
      method: 'POST',
      body: JSON.stringify({ name: title, link: imageLink })
    });
  }

  async removeCard(cardId) {
    return this._performRequest(`/cards/${cardId}`, {
      method: 'DELETE'
    });
  }

  async toggleLike(cardId, shouldRemoveLike) {
    return this._performRequest(`/cards/likes/${cardId}`, {
      method: shouldRemoveLike ? 'DELETE' : 'PUT'
    });
  }
}

export const api = new MestoApiClient({
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-203',
  headers: {
    authorization: '5b30f481-cd82-46fc-8976-a1313818c16f',
    'Content-Type': 'application/json'
  }
});