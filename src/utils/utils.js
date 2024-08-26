// src/utils/utils.js

/**
 * Fetches the product list from the API and stores it in localStorage as 'offlineProductList'.
 * @returns {Promise<void>} A promise that resolves once the product list is fetched and stored.
 * @throws {Error} Throws an error if the fetch operation fails or the product list is empty/undefined.
 */
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
        const productList = data.body;

        if (productList && Array.isArray(productList)) {
            // Assuming the API response is an array of products
            localStorage.setItem('offlineProductList', JSON.stringify(productList));
        } else {
            console.error('Product list is empty or undefined');
        }
    } catch (error) {
        console.error('Error fetching and storing product list:', error);
    }
}
