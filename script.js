document.addEventListener("DOMContentLoaded", function() {
  const API_BASE_URL = 'http://localhost:8000/api/v1/titles/';
  const NO_PICTURE_PATH = '/src/img/no-picture.jpg';

  // Open modal window
  function openModal(movieId) {
      fetch(`${API_BASE_URL}${movieId}`)
          .then(response => response.json())
          .then(data => {
              document.getElementById('modal-image').src = data.image_url || NO_PICTURE_PATH;
              document.getElementById('modal-title').textContent = data.title;
              document.getElementById('movie-year').textContent = data.year;
              document.getElementById('movie-genre').textContent = data.genres;
              document.getElementById('movie-duration').textContent = data.duration;
              document.getElementById('movie-countries').textContent = data.countries;
              document.getElementById('movie-imdb-score').textContent = data.imdb_score;
              document.getElementById('modal-description').textContent = data.description;
              document.getElementById('modal-directors').textContent = data.directors.join(', ');
              document.getElementById('modal-cast').textContent = data.actors.join(', ');
              document.getElementById('movie-modal').style.display = 'block';
          })
          .catch(error => console.error('Error fetching movie details:', error));
  }

  // Close modal window
  document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('movie-modal').style.display = 'none';
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('movie-modal').style.display = 'none';
  });

  // Best movie
  function loadBestMovie() {
      fetch(`${API_BASE_URL}?sort_by=-imdb_score`)
          .then(response => response.json())
          .then(data => {
              const bestMovie = data.results[0];
              const bestMovieId = bestMovie.id;

              // Update image and title
              document.getElementById('best-movie-image').src = bestMovie.image_url || NO_PICTURE_PATH;
              document.getElementById('best-movie-title').textContent = bestMovie.title;

              // Fetch details for best movie description (separate call)
              fetch(`${API_BASE_URL}${bestMovieId}`)
                  .then(response => response.json())
                  .then(movieDetails => {
                      document.getElementById('best-movie-description').textContent = movieDetails.description;
                  })
                  .catch(error => console.error('Error fetching best movie description:', error));

              const detailsButton = document.getElementById('best-movie-details-button');
              detailsButton.dataset.movieId = bestMovieId;
              detailsButton.addEventListener('click', () => openModal(bestMovieId));
          })
          .catch(error => console.error('Error fetching best movie:', error));
  }

  // Movie item creation
  function createMovieCard(movie) {
      const movieItem = document.createElement('div');
      movieItem.className = 'movie-item';

      const movieImg = document.createElement('img');
      movieImg.src = movie.image_url;
      movieImg.alt = movie.title;
      movieImg.onerror = () => {
          movieImg.src = NO_PICTURE_PATH;
      };

      const movieOverlay = document.createElement('div');
      movieOverlay.className = 'movie-overlay';

      const movieTitle = document.createElement('div');
      movieTitle.className = 'movie-title';
      movieTitle.textContent = movie.title;

      const detailsButton = document.createElement('button');
      detailsButton.textContent = 'Détails';
      detailsButton.dataset.movieId = movie.id;
      detailsButton.addEventListener('click', () => openModal(movie.id));

      movieOverlay.appendChild(movieTitle);
      movieOverlay.appendChild(detailsButton);
      movieItem.appendChild(movieImg);
      movieItem.appendChild(movieOverlay);

      return movieItem;
  }

  function getNumberOfCards() {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 599) {
          return 2; // 2 cards for phone
      } else if (screenWidth <= 1199) {
          return 4; // 4 cards for tablet
      } else {
          return 6; // 6 cards for desktop
      }
  }
// Best movies
  function loadBestMovies(gridId, paginationId) {
      let currentPage = 1;
      const moviesGrid = document.getElementById(gridId);
      const paginationContainer = document.getElementById(paginationId);
      let showingMore = false;

      function loadPage(page, numberOfCards) {
          fetch(`${API_BASE_URL}?sort_by=-imdb_score&page=${page}`)
              .then(response => response.json())
              .then(data => {
                  moviesGrid.innerHTML = '';

                  const moviesToDisplay = calculateMoviesToDisplay(data.results, numberOfCards);
                  moviesToDisplay.forEach(movie => {
                      const movieCard = createMovieCard(movie);
                      moviesGrid.appendChild(movieCard);
                  });

                  const remainingCards = numberOfCards - moviesToDisplay.length;
                  if (remainingCards > 0 && data.next) {
                      fetch(data.next)
                          .then(response => response.json())
                          .then(nextPageData => {
                              const additionalMovies = nextPageData.results.slice(0, remainingCards);
                              additionalMovies.forEach(movie => {
                                  const movieCard = createMovieCard(movie);
                                  moviesGrid.appendChild(movieCard);
                              });
                          })
                          .catch(error => console.error('Error fetching next page:', error));
                  }

                  paginationContainer.innerHTML = '';
                  if (data.results.length > numberOfCards || showingMore) {
                      const voirPlusButton = document.createElement('button');
                      voirPlusButton.textContent = showingMore ? 'Voir moins' : 'Voir plus';
                      voirPlusButton.addEventListener('click', () => {
                          showingMore = !showingMore;
                          loadPage(1, showingMore ? 6 : getNumberOfCards());
                      });
                      paginationContainer.appendChild(voirPlusButton);
                  }
              })
              .catch(error => console.error('Error fetching best movies:', error));
      }

      loadPage(currentPage, getNumberOfCards());

      window.addEventListener('resize', () => {
          loadPage(currentPage, getNumberOfCards());
      });
  }

  function calculateMoviesToDisplay(allMovies, numberOfCards) {
      const startIndex = 0;
      const endIndex = startIndex + numberOfCards;
      return allMovies.slice(startIndex, endIndex);
  }


  // Load movies information from the selected category
  function loadMoviesByCategory(category, gridId, paginationId) {
      let currentPage = 1;
      const moviesGrid = document.getElementById(gridId);
      const paginationContainer = document.getElementById(paginationId);
      let showingMore = false;

      function loadPage(page, numberOfCards) {
          fetch(`${API_BASE_URL}?genre=${category}&page=${page}`)
              .then(response => response.json())
              .then(data => {
                  moviesGrid.innerHTML = '';

                  const moviesToDisplay = calculateMoviesToDisplay(data.results, numberOfCards);
                  moviesToDisplay.forEach(movie => {
                      const movieCard = createMovieCard(movie);
                      moviesGrid.appendChild(movieCard);
                  });

                  const remainingCards = numberOfCards - moviesToDisplay.length;
                  if (remainingCards > 0 && data.next) {
                      fetch(data.next)
                          .then(response => response.json())
                          .then(nextPageData => {
                              const additionalMovies = nextPageData.results.slice(0, remainingCards);
                              additionalMovies.forEach(movie => {
                                  const movieCard = createMovieCard(movie);
                                  moviesGrid.appendChild(movieCard);
                              });
                          })
                          .catch(error => console.error('Error fetching next page:', error));
                  }

                  paginationContainer.innerHTML = '';
                  if (data.results.length > numberOfCards || showingMore) {
                      const voirPlusButton = document.createElement('button');
                      voirPlusButton.textContent = showingMore ? 'Voir moins' : 'Voir plus';
                      voirPlusButton.addEventListener('click', () => {
                          showingMore = !showingMore;
                          loadPage(1, showingMore ? 6 : getNumberOfCards());
                      });
                      paginationContainer.appendChild(voirPlusButton);
                  }
              })
              .catch(error => console.error(`Error fetching movies for category ${category}:`, error));
      }

      loadPage(currentPage, getNumberOfCards());

      window.addEventListener('resize', () => {
          loadPage(currentPage, getNumberOfCards());
      });
  }
  // Load categories to select
  function loadCategories() {
    fetch(`${API_BASE_URL}?sort_by=-imdb_score`)
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('category-select');
            const categories = new Set(data.results.map(movie => movie.genres).flat());

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);

                // Set "History" option as selected
                if (category === 'History') {
                    option.selected = true;
                }
            });

            // Set initial category - "History" 
            loadMoviesByCategory('History', 'other-movies-grid', 'other-pagination');

            categorySelect.addEventListener('change', event => {
                loadMoviesByCategory(event.target.value, 'other-movies-grid', 'other-pagination');
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

 
  loadBestMovie();
  loadBestMovies('best-movies-grid', 'best-pagination');
  loadMoviesByCategory('Action', 'action-movies-grid', 'action-pagination');
  loadMoviesByCategory('Animation', 'animation-movies-grid', 'animation-pagination');
  loadCategories();
});
