const api = "http://127.0.0.1:5000";

window.onload = () => {
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

function searchButtonOnClick()  {
    // BEGIN CODE HERE
    console.log("searchButtonOnClick")

    const query = document.getElementById('search-query').value;
    fetch(`${api}/search?name=${query}`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const resultsBody = document.getElementById('results-body');
      resultsBody.innerHTML = ""; // Καθαρισμός προηγούμενων αποτελεσμάτων

      data.forEach(product => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const productionYearCell  = document.createElement('td');
        const priceCell = document.createElement('td');
        const colorCell  = document.createElement('td');
        const sizeCell = document.createElement('td');

        nameCell.textContent = product.name;
        priceCell.textContent = product.price;
        idCell.textContent = product.id;
        colorCell.textContent = product.color;
        productionYearCell.textContent = product.production_year;
        sizeCell.textContent = product.size;

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(productionYearCell);
        row.appendChild(priceCell);
        row.appendChild(colorCell);
        row.appendChild(sizeCell);
        resultsBody.appendChild(row);
      });
    })
    .catch(error => console.error('Error:', error));

    // END CODE HERE
}

function productFormOnSubmit(event) {
    // BEGIN CODE HERE

    event.preventDefault(); // Αποτροπή της προεπιλεγμένης συμπεριφοράς υποβολής της φόρμας

    const productName = document.getElementById('product-name').value;
    const productProductionYear = document.getElementById('product-production-year').value;
    const productPrice = document.getElementById('product-price').value;
    const productColor = document.getElementById('product-color').value;
    const productSize = document.getElementById('product-size').value;
    

    const product = {

        id: Math.floor(Math.random() * 1000),
        name: productName,
        production_year: productProductionYear,
        color: productColor,
        size: productSize,
        price: productPrice,
    };

    fetch(`${api}/add-product`, {
      
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    })
    .then(response => {
        if (response.ok) {
            alert("Προϊόν προστέθηκε με επιτυχία!");
            document.getElementById('add-product-form').reset(); 
        } else {
            alert("Υπήρξε κάποιο πρόβλημα κατά την προσθήκη του προϊόντος.");
        }
    })
    .catch(error => console.error('Error:', error));

    // END CODE HERE
}
