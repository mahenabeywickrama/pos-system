import { customer_db } from "/db/db.js";
import { item_db } from "/db/db.js";
import { orders_db } from "/db/db.js";
import { ordersItem_db } from "/db/db.js";

import OrdersModel from "/model/OrdersModel.js";
import OrdersItemModel from "/model/OrdersItemModel.js";

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

    const today = new Date().toISOString().split('T')[0];
    $('#order-date').val(today);

    $('#order-id').val(generateNextOrderId());
    $('#cus-name, #item-name, #qoh, #unit-price, #order-qty').val('');
    $('#order-customer').prop('selectedIndex', 0);
    $('#order-item').prop('selectedIndex', 0);
    $('#search-cus-id').val('');
    $('#search-item-id').val('');
    $('#discount').val('');
    $('#discount-amount').val('');
    $('#total').val('');
    $('#subtotal').val('');
    $('#cash').val('');
    $('#order-balance').val('');

    $('#search-order-id').val('')
    $('#date-order').val('');
    $('#order-cus-id').val('');
    $('#order-cus-name').val('');
    $('#order-discount').val('');
    $('#order-discount-amount').val('');
    $('#order-total').val('');
    $('#order-cash').val('');
    $('#balance-order').val('');

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
        cmbCustomers.append(`<option value="${item.id}">${item.id}</option>`);
    });
}

function loadItemsCmb() {
    const cmbItems = $('#order-item');
    cmbItems.empty().append('<option selected disabled>Choose...</option>');

    item_db.forEach((item) => {
        cmbItems.append(`<option value="${item.id}">${item.id}</option>`);
    });
}

$('#search-cus-btn').off('click').on('click', () => {
    const inputId = $('#search-cus-id').val().trim();
    if (!inputId) {
        Swal.fire({ title: "Error!", text: "Please enter a Customer ID.", icon: "error" });
        return;
    }

    const customer = customer_db.find(cus => cus.id === inputId);
    if (customer) {
        $('#order-customer').val(customer.id);
        $('#cus-name').val(`${customer.fname} ${customer.lname}`);
    } else {
        Swal.fire({ title: "Error!", text: "Customer ID not found!", icon: "error" });
    }
});

$('#search-item-btn').off('click').on('click', () => {
    const inputId = $('#search-item-id').val().trim();
    if (!inputId) {
        Swal.fire({ title: "Error!", text: "Please enter an Item ID.", icon: "error" });
        return;
    }

    const item = item_db.find(it => it.id === inputId);
    if (item) {
        $('#order-item').val(item.id);
        $('#item-name').val(item.name);
        $('#qoh').val(item.qty);
        $('#unit-price').val(item.price);
    } else {
        Swal.fire({ title: "Error!", text: "Item ID not found!", icon: "error" });
    }
});

$('#order-customer').change(function () {
    const selectedId = $(this).val();
    const customer = customer_db.find(item => item.id === selectedId);

    if (customer) {
        $('#cus-name').val(customer.fname + " " + customer.lname);
        $('#search-cus-id').val(selectedId);
    }
});

$('#order-item').change(function () {
    const selectedId = $(this).val();
    const item = item_db.find(it => it.id === selectedId);

    if (item) {
        $('#item-name').val(item.name);
        $('#qoh').val(item.qty);
        $('#unit-price').val(item.price);
        $('#search-item-id').val(item.id);
    }
});

$('#add-to-cart').off('click').on('click', function () {
    const itemId = $('#search-item-id').val();
    const itemName = $('#item-name').val();
    const qoh = parseInt($('#qoh').val());
    const unitPrice = parseFloat($('#unit-price').val());
    const orderQty = parseInt($('#order-qty').val());

    if (!itemId || isNaN(orderQty) || orderQty <= 0) {
        Swal.fire({ title: "Error!", text: "Please select an item and enter a valid quantity.", icon: "error" });
        return;
    }

    const existingItem = cart.find(item => item.itemId === itemId);

    if (existingItem) {
        const newTotalQty = existingItem.quantity + orderQty;
        if (newTotalQty > qoh) {
            Swal.fire({ title: "Error!", text: "Total quantity exceeds stock.", icon: "error" });
            return;
        }
        existingItem.quantity = newTotalQty;
        existingItem.total = newTotalQty * unitPrice;
    } else {
        if (orderQty > qoh) {
            Swal.fire({ title: "Error!", text: "Order quantity exceeds stock.", icon: "error" });
            return;
        }
        cart.push({
            itemId,
            itemName,
            quantity: orderQty,
            unitPrice,
            total: orderQty * unitPrice
        });
    }

    $('#order-qty').val('');
    updateCartTable();
});

function updateCartTable() {
    const tbody = $('#order-summary');
    tbody.empty();
    let subTotal = 0;

    cart.forEach((item, index) => {
        subTotal += item.total;
        tbody.append(`
            <tr>
                <td>${item.itemId}</td>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.total.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger">🗑</button></td>
            </tr>
        `);
    });

    $('#subtotal').val(subTotal.toFixed(2));
    updateTotal();
}

$('#order-summary').off('click').on('click', '.btn-danger', function () {
    const index = $(this).closest('tr').index();
    cart.splice(index, 1);
    updateCartTable();
});

$('#discount').on('input', updateTotal);

function updateTotal() {
    const subtotal = parseFloat($('#subtotal').val()) || 0;
    const discount = parseFloat($('#discount').val()) || 0;
    const MAX_DISCOUNT = 100;

    if (discount > MAX_DISCOUNT) {
        Swal.fire({ title: "Error!", text: "Invalid Discount.", icon: "error" });
        $('#discount').val('');
        $('#total').val('0.00');
        $('#discount-amount').val('0.00');
        return;
    }

    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    $('#discount-amount').val(discountAmount.toFixed(2));
    $('#total').val(total.toFixed(2));

    const cash = Number($('#cash').val());
    if (!isNaN(cash)) {
        const balance = cash - total;
        $('#order-balance').val(balance >= 0 ? balance.toFixed(2) : "Insufficient");
    }
}

$('#order_place').off('click').on('click', () => {
    const orderId = $('#order-id').val();
    const date = $('#order-date').val();
    const customerId = $('#search-cus-id').val();
    const customerName = $('#cus-name').val();
    const discountPer = $('#discount').val();
    const discountAmount = parseFloat($('#discount-amount').val());
    const total = parseFloat($('#total').val());
    const cash = parseFloat($('#cash').val())
    const balance = parseFloat($('#order-balance').val())

    if (!orderId || !date || !customerId || cart.length === 0 || isNaN(total)) {
        Swal.fire({ title: "Error!", text: "Please fill all order details correctly.", icon: "error" });
        return;
    }

    if (isNaN(cash) || cash < total) {
        Swal.fire({ title: "Error!", text: "Insufficient cash to place the order.", icon: "error" });
        return;
    }

    // const roundedTotal = Number(total.toFixed(2));
    const newOrder = new OrdersModel(orderId, customerId, customerName, discountPer, discountAmount, total, cash, balance, date);

    orders_db.push(newOrder);

    cart.forEach(cartItem => {
        const orderItem = new OrdersItemModel(orderId, cartItem.itemId, cartItem.quantity, cartItem.unitPrice);
        ordersItem_db.push(orderItem);

        const item = item_db.find(i => i.id === cartItem.itemId);
        if (item) {
            item.qty -= cartItem.quantity;
        }
    });

    Swal.fire({ title: "Success!", text: "Order placed successfully.", icon: "success" });
    resetOrderForm();
    loadOrders();
});

$('#cash').on('input', function () {
    const cash = Number($(this).val());
    const total = Number($('#total').val());
    const balance = cash - total;

    if (!isNaN(balance) && cash >= 0) {
        $('#order-balance').val(balance >= 0 ? balance.toFixed(2) : "Insufficient");
    } else {
        $('#order-balance').val('');
    }
});

$('#order_reset').off('click').on('click', resetOrderForm);

$('#search-order-btn').off('click').on('click', () => {
    const inputId = $('#search-order-id').val().trim();
    if (!inputId) {
        Swal.fire({ title: "Error!", text: "Please enter a Order ID.", icon: "error" });
        return;
    }

    const order = orders_db.find(order => order.id === inputId);
    if (order) {
        $('#date-order').val(order.date);
        $('#order-cus-id').val(order.cusId);
        $('#order-cus-name').val(order.customerName);
        $('#order-discount').val(order.discountPer);
        $('#order-discount-amount').val(order.discountAmount);
        $('#order-total').val((order.totalPrice));
        $('#order-cash').val(order.cash);
        $('#balance-order').val(order.balance);
    } else {
        Swal.fire({ title: "Error!", text: "Order ID not found!", icon: "error" });
    }
});
