import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '14851354-5f3abbeacded0434ca4aa137e';

const searchForm = document.querySelector('#search-form');
const submitButton = document.querySelector('#submit-button');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let page = 1;
let searchQuery = '';

Notiflix.Loading.init({ svgColor: '#00ff00' });

const fetchData = async () => {
  try {
    Notiflix.Loading.standard('Loading...');

    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    Notiflix.Loading.remove();

    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    hits.forEach(hit => {
      const card = createCard(hit);
      gallery.appendChild(card);
    });

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    page++;

    if (page > Math.ceil(totalHits / 40)) {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreButton.style.display = 'block';
    }

    scrollPage();
  } catch (error) {
    console.error(error);
    Notiflix.Loading.remove();
    Notiflix.Notify.failure(
      'An error occurred while fetching images. Please try again.'
    );
  }
};

const createCard = image => {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;

  const card = document.createElement('div');
  card.classList.add('photo-card');

  const imageLink = document.createElement('a');
  imageLink.href = largeImageURL;
  imageLink.setAttribute('data-lightbox', 'gallery');
  card.appendChild(imageLink);

  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';
  imageLink.appendChild(img);

  const info = document.createElement('div');
  info.classList.add('info');
  card.appendChild(info);

  const likesInfo = createInfoItem('Likes', likes);
  const viewsInfo = createInfoItem('Views', views);
  const commentsInfo = createInfoItem('Comments', comments);
  const downloadsInfo = createInfoItem('Downloads', downloads);

  info.appendChild(likesInfo);
  info.appendChild(viewsInfo);
  info.appendChild(commentsInfo);
  info.appendChild(downloadsInfo);

  return card;
};

const createInfoItem = (label, value) => {
  const infoItem = document.createElement('p');
  infoItem.classList.add('info-item');

  const labelElement = document.createElement('b');
  labelElement.textContent = label;
  infoItem.appendChild(labelElement);

  infoItem.insertAdjacentHTML('beforeend', `: ${value}`);

  return infoItem;
};

const scrollPage = () => {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

const handleInputChange = () => {
  const inputValue = searchForm.elements.searchQuery.value.trim();

  if (inputValue === '' || inputValue === ' ') {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
};

searchForm.addEventListener('input', handleInputChange);

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const inputValue = e.target.elements.searchQuery.value.trim();

  if (inputValue === '' || inputValue === ' ') {
    return;
  }

  gallery.innerHTML = '';
  page = 1;
  searchQuery = inputValue;
  fetchData();
  loadMoreButton.style.display = 'none';
});

loadMoreButton.addEventListener('click', () => {
  fetchData();
});
