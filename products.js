const api = "http://127.0.0.1:5000";

window.onload = function() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('homepage.html')) {
    document.getElementById('home-link').classList.add('active');
  } else if (currentPath.includes('products.html')) {
    document.getElementById('products-link').classList.add('active');
    // Προσθήκη event listener για τη φόρμα αναζήτησης
    document.getElementById('search-form').addEventListener('submit', function(event) {
      event.preventDefault();
      searchButtonOnClick();
    });

    // Προσθήκη event listener για τη φόρμα προσθήκης προϊόντος
    document.getElementById('add-product-form').addEventListener('submit', function(event) {
      event.preventDefault();
      productFormOnSubmit(event);
    });

  }
};

searchButtonOnClick = () => {
    // BEGIN CODE HERE

    const query = document.getElementById('search-query').value;
  fetch(`${api}/search?q=${query}`)
    .then(response => response.json())
    .then(data => {
      const resultsBody = document.getElementById('results-body');
      resultsBody.innerHTML = ""; // Καθαρισμός προηγούμενων αποτελεσμάτων

      data.forEach(product => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const priceCell = document.createElement('td');

        nameCell.textContent = product.name;
        priceCell.textContent = product.price;

        row.appendChild(nameCell);
        row.appendChild(priceCell);
        resultsBody.appendChild(row);
      });
    })
    .catch(error => console.error('Error:', error));

    // END CODE HERE
}

productFormOnSubmit = (event) => {
    // BEGIN CODE HERE

    event.preventDefault(); // Αποτροπή της προεπιλεγμένης συμπεριφοράς υποβολής της φόρμας

    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;

    const product = {
        name: productName,
        price: productPrice
    };

    fetch('/add-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    })
    .then(response => {
        if (response.ok) {
            alert("Προϊόν προστέθηκε με επιτυχία!");
            document.getElementById('add-product-form').reset(); // Επαναφορά της φόρμας
        } else {
            alert("Υπήρξε κάποιο πρόβλημα κατά την προσθήκη του προϊόντος.");
        }
    })
    .catch(error => console.error('Error:', error));

    // END CODE HERE
}
