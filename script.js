document.addEventListener("DOMContentLoaded", function() {
  const API_BASE_URL = 'http://localhost:8000/api/v1/titles/';
  const NO_PICTURE_PATH = '/src/img/no-picture.jpg';

  // Movie card creation
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
            .catch(error => console.error('Erreur lors de la récupération de la description du meilleur film:', error));
    
          const detailsButton = document.getElementById('best-movie-details-button');
          detailsButton.dataset.movieId = bestMovieId;
          detailsButton.addEventListener('click', () => openModal(bestMovieId));
        })
        .catch(error => console.error('Erreur lors de la récupération du meilleur film:', error));
    }
    // Open modal wondow
  function openModal(movieId) {
    fetch(`${API_BASE_URL}${movieId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('modal-image').src = data.image_url
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
        .catch(error => console.error('Erreur lors de la récupération des détails du film:', error));
}

// Close modal window
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('movie-modal').style.display = 'none';
});

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('movie-modal').style.display = 'none';
});


loadBestMovie();
});