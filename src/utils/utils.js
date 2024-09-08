// src/utils/utils.js

import { getProductList } from './api'; // Import the API utility function

export async function fetchAndStoreProductList() {
    try {
        const productList = await getProductList(); // Use the utility function to fetch the product list
        console.log('Fetched Product List:', productList); // Log the fetched product list

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
