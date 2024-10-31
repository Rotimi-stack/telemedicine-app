// Select carousel element and initialize it with Bootstrap's Carousel API
const carousel = new bootstrap.Carousel(document.getElementById('carouselExampleIndicators'));

// Add event listeners to control the carousel
document.querySelector('.carousel-control-prev').addEventListener('click', () => {
  carousel.prev(); // Moves to the previous slide
});

document.querySelector('.carousel-control-next').addEventListener('click', () => {
  carousel.next(); // Moves to the next slide
});
