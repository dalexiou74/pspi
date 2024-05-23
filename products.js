const api = "http://127.0.0.1:5000";

window.onload = function() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('homepage')) {
    document.getElementById('home-link').classList.add('active');
  } else if (currentPath.includes('products')) {
    document.getElementById('products-link').classList.add('active');
  }
};

searchButtonOnClick = () => {
    // BEGIN CODE HERE

    // END CODE HERE
}

productFormOnSubmit = (event) => {
    // BEGIN CODE HERE

    // END CODE HERE
}
