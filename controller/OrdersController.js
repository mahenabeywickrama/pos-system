import {customer_db} from "/db/db.js";
import {item_db} from "/db/db.js";
import {orders_db} from "/db/db.js";
import {ordersItem_db} from "/db/db.js";

import CustomerModel from "/model/CustomerModel.js";
import ItemModel from "/model/ItemModel.js";
import OrdersModel from "/model/OrdersModel.js";
import OrdersItemModel from "/model/OrdersItemModel.js";

// $(document).ready(function() {
//     loadOrders();
//     resetOrderForm();
// });

function generateNextOrderId() {
    if (orders_db.length === 0) {
        return 'O001';
    }

    let lastId = orders_db[orders_db.length - 1].id;
    let number = parseInt(lastId.replace('O', '')) + 1;

    return 'O' + number.toString().padStart(3, '0');
}

export function resetOrderForm() {
    $('#order-id').val(generateNextOrderId())
    $('#order-date, #cus-name, #item-name, #qoh, #unit-price, #order-qty').val('');
    $('#order-customer').prop('selectedIndex', 0);
    $('#order-item').prop('selectedIndex', 0);

    loadCustomersCmb();
    loadItemsCmb();
}

export function loadOrders() {
    const tbody = $('#order-tbody');
    tbody.empty();

    orders_db.forEach((item) => {
        let data = `<tr data-id="${item.id}">
                        <td>${item.id}</td>
                        <td>${item.cusId}</td>
                        <td>${item.totalPrice}</td>
                        <td>${item.date}</td>
                    </tr>`;
        tbody.append(data);
    });
}

function loadCustomersCmb() {
    const cmbCustomers = $('#order-customer');
    cmbCustomers.empty().append('<option selected disabled>Choose...</option>');

    customer_db.forEach((item) => {
        let option = `<option value="${item.id}">${item.id}</option>`;
        cmbCustomers.append(option);
    });
}

function loadItemsCmb() {
    const cmbItems = $('#order-item');
    cmbItems.empty().append('<option selected disabled>Choose...</option>');

    item_db.forEach((item) => {
        let option = `<option value="${item.id}">${item.id}</option>`;
        cmbItems.append(option);
    });
}

$('#order-customer').change(function () {
    const selectedCustomerId = $(this).val();
    let customerName = null;

    customer_db.forEach(item => {
        if (item.id === selectedCustomerId) {
            customerName = item.fname + " " + item.lname;
        }
    })

    if (customerName != null) {
        $('#cus-name').val(customerName);
    }
});

$('#order-item').change(function () {
    const selectedItemId = $(this).val();
    let itemName = null;
    let qoh = null;
    let price = null;

    item_db.forEach(item => {
        if (item.id === selectedItemId) {
            itemName = item.name;
            qoh = item.qty;
            price = item.price;
        }
    })

    if (itemName != null && qoh!= null && price!= null) {
        $('#item-name').val(itemName);
        $('#qoh').val(qoh);
        $('#unit-price').val(price);
    }
});

$('#order_reset').off('click').on('click', resetOrderForm);