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

let cart = [];
let itemCount = 0;

function generateNextOrderId() {
    if (orders_db.length === 0) {
        return 'O001';
    }

    let lastId = orders_db[orders_db.length - 1].id;
    let number = parseInt(lastId.replace('O', '')) + 1;

    return 'O' + number.toString().padStart(3, '0');
}

export function resetOrderForm() {
    cart = [];
    itemCount = 0;
    updateCartTable();

    $('#order-id').val(generateNextOrderId())
    $('#order-date, #cus-name, #item-name, #qoh, #unit-price, #order-qty').val('');
    $('#order-customer').prop('selectedIndex', 0);
    $('#order-item').prop('selectedIndex', 0);

    $('#search-cus-id').val('')
    $('#search-item-id').val('')

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

$('#search-cus-btn').off('click').on('click', () => {
    const inputId = $('#search-cus-id').val().trim();

    if (!inputId) {
        Swal.fire({title: "Error!", text: "Please enter a Customer ID.", icon: "error"});
        return;
    }

    const customer = customer_db.find(cus => cus.id === inputId);

    if (customer) {
        $('#order-customer').val(customer.id);
        $('#cus-name').val(`${customer.fname} ${customer.lname}`);
    } else {
        Swal.fire({title: "Error!", text: "Customer ID not found!", icon: "error"});
    }
});

$('#search-item-btn').off('click').on('click', () => {
    const inputId = $('#search-item-id').val().trim();

    if (!inputId) {
        Swal.fire({title: "Error!", text: "Please enter an Item ID..", icon: "error"});
        return;
    }

    const item = item_db.find(it => it.id === inputId);

    if (item) {
        $('#order-item').val(item.id);
        $('#item-name').val(item.name);
        $('#qoh').val(item.qty);
        $('#unit-price').val(item.price);
    } else {
        Swal.fire({title: "Error!", text: "Item ID not found!", icon: "error"});
    }
});

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
        $('#search-cus-id').val(selectedCustomerId);
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
        $('#search-item-id').val(selectedItemId);
    }
});

$('#add-to-cart').off('click').on('click', function () {
    const itemId = $('#search-item-id').val();
    const itemName = $('#item-name').val();
    const qoh = parseInt($('#qoh').val());
    const unitPrice = parseFloat($('#unit-price').val());
    const orderQty = parseInt($('#order-qty').val());

    if (!itemId || isNaN(orderQty) || orderQty <= 0) {
        Swal.fire({title: "Error!", text: "Please select an item and enter a valid quantity.", icon: "error"});
        return;
    }

    const existingItem = cart.find(item => item.itemId === itemId);

    if (existingItem) {
        const newTotalQty = existingItem.quantity + orderQty;

        if (newTotalQty > qoh) {
            Swal.fire({title: "Error!", text: "Total quantity in cart exceeds available stock.", icon: "error"});
            return;
        }

        existingItem.quantity = newTotalQty;
        existingItem.total = newTotalQty * unitPrice;
    } else {
        if (orderQty > qoh) {
            Swal.fire({title: "Error!", text: "Order quantity exceeds available stock.", icon: "error"});
            return;
        }

        const cartItem = {
            id: itemCount++,
            itemId: itemId,
            itemName,
            quantity: orderQty,
            unitPrice,
            total: orderQty * unitPrice
        };

        $('#order-qty').val('');

        cart.push(cartItem);
    }

    updateCartTable();
});

function updateCartTable() {
    const tbody = $('#order-summary');
    tbody.empty();

    let subTotal = 0;

    cart.forEach((item, index) => {
        subTotal += item.total;

        let itemRow = `
            <tr>
                <td>${item.id}</td>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.total.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeCartItem(${index})">🗑</button></td>
            </tr>
        `;

        tbody.append(itemRow);
    });

    $('#subtotal').val(subTotal.toFixed(2));
    updateTotal();
}

$('#discount').off('input').on('input', updateTotal);

function updateTotal() {
    const subtotal = parseFloat($('#subtotal').val()) || 0;
    const discountPercentage = parseFloat($('#discount').val()) || 0;

    if (discountPercentage > 100) {
        Swal.fire({title: "Error!", text: "Invalid Discount.", icon: "error"});
        $('#discount').val('');
        $('#total').val(0.00);
        $('#discount-amount').val(0.00);
        return;
    }

    const validDiscount = Math.min(Math.max(discountPercentage, 0), 100);

    const discountAmount = (subtotal * validDiscount) / 100;
    const total = subtotal - discountAmount;

    $('#total').val(total.toFixed(2));
    $('#discount-amount').val(discountAmount.toFixed(2));
}


$('#order-summary').off('click', '.btn-danger').on('click', '.btn-danger', function() {
    const index = $(this).closest('tr').index();
    removeCartItem(index);
});

function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartTable();
}

$('#order_reset').off('click').on('click', resetOrderForm);