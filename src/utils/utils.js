// src/utils/utils.js

export async function fetchAndStoreProductList() {
    try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product list');
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the entire API response

        // Parse the body if it's a string
        const productList = JSON.parse(data.body);

        if (productList && Array.isArray(productList) && productList.length > 0) {
            // Assuming the API response is an array of products
            localStorage.setItem('offlineProductList', JSON.stringify(productList));
            console.log('Product list fetched and stored successfully.');
        } else {
            console.error('Product list is empty or undefined');
        }
    } catch (error) {
        console.error('Error fetching and storing product list:', error);
    }
}
