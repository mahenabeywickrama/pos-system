import { loadCustomers, resetCustomerForm } from '/controller/CustomerController.js';
import { loadItems, resetItemForm } from '/controller/ItemController.js';
import { loadOrders, resetOrderForm } from '/controller/OrdersController.js';

function showSection(sectionId, title, element) {
    $('#dashboard-content, #customer-content, #item-content, #order-content').hide();
    $(sectionId).show();
    $('.topbar').text(title);
    $('.nav-link').removeClass('active');
    $(element).addClass('active');
}

$('#home-btn').on('click', function () {
    showSection('#home-content', 'Home', this);
});

$('#customer-btn').on('click', function () {
    showSection('#customer-content', 'Customer', this);
    loadCustomers();
    resetCustomerForm();
});

$('#item-btn').on('click', function () {
    showSection('#item-content', 'Item', this);
    loadItems();
    resetItemForm();
});

$('#order-btn').on('click', function () {
    showSection('#order-content', 'Place Order', this);
    loadOrders();
    resetOrderForm();
});

$(document).on('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
    }
});
