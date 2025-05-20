import { customer_db } from "/db/db.js";
import CustomerModel from "/model/CustomerModel.js";

let selectedIndex = -1;

function generateNextCustomerId() {
    if (customer_db.length === 0) {
        return 'C001';
    }

    let lastId = customer_db[customer_db.length - 1].id;
    let number = parseInt(lastId.replace('C', '')) + 1;

    return 'C' + number.toString().padStart(3, '0');
}

export function resetCustomerForm() {
    $('#cus-id').val(generateNextCustomerId());
    $('#fname, #lname, #email, #phone, #address').val('');
    selectedIndex = -1;
}

export function loadCustomers() {
    const tbody = $('#customer-tbody');
    tbody.empty();

    customer_db.forEach((item) => {
        let data = `<tr data-id="${item.id}">
                        <td>${item.id}</td>
                        <td>${item.fname}</td>
                        <td>${item.lname}</td>
                        <td>${item.address}</td>
                        <td>${item.email}</td>
                        <td>${item.phone}</td>
                    </tr>`;
        tbody.append(data);
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9]{10,15}$/.test(phone);
}

$('#customer_save').off('click').on('click', function () {
    let id = $('#cus-id').val().trim();
    let fname = $('#fname').val().trim();
    let lname = $('#lname').val().trim();
    let address = $('#address').val().trim();
    let email = $('#email').val().trim();
    let phone = $('#phone').val().trim();

    if (!id || !fname || !lname || !address) {
        Swal.fire({ title: "Error!", text: "Please fill in all required fields!", icon: "error" });
        return;
    }

    if (email && !isValidEmail(email)) {
        Swal.fire({ title: "Invalid Email!", text: "Please enter a valid email address.", icon: "error" });
        return;
    }

    if (phone && !isValidPhone(phone)) {
        Swal.fire({ title: "Invalid Phone!", text: "Phone number must be 10 to 15 digits.", icon: "error" });
        return;
    }

    if (customer_db.some(c => c.id === id)) {
        Swal.fire({ title: "Error!", text: "Customer ID already exists!", icon: "error" });
        return;
    }

    const customer = new CustomerModel(id, fname, lname, address, email, phone);
    customer_db.push(customer);

    loadCustomers();
    resetCustomerForm();

    Swal.fire({ title: "Added Successfully!", icon: "success" });
});

$('#customer_update').off('click').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({ title: "No Selection!", text: "Please select a customer to update.", icon: "info" });
        return;
    }

    let id = $('#cus-id').val().trim();
    let fname = $('#fname').val().trim();
    let lname = $('#lname').val().trim();
    let address = $('#address').val().trim();
    let email = $('#email').val().trim();
    let phone = $('#phone').val().trim();

    if (!id || !fname || !lname || !address) {
        Swal.fire({ title: "Error!", text: "Please fill in all required fields!", icon: "error" });
        return;
    }

    if (email && !isValidEmail(email)) {
        Swal.fire({ title: "Invalid Email!", text: "Please enter a valid email address.", icon: "error" });
        return;
    }

    if (phone && !isValidPhone(phone)) {
        Swal.fire({ title: "Invalid Phone!", text: "Phone number must be 10 to 15 digits.", icon: "error" });
        return;
    }

    customer_db[selectedIndex] = new CustomerModel(id, fname, lname, address, email, phone);

    loadCustomers();
    resetCustomerForm();

    Swal.fire({ title: "Updated Successfully!", icon: "success" });
});

$('#customer_delete').off('click').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({ title: "No Selection!", text: "Please select a customer to delete.", icon: "info" });
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: 'This customer will be removed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            customer_db.splice(selectedIndex, 1);
            loadCustomers();
            resetCustomerForm();

            Swal.fire({ title: "Deleted Successfully!", icon: "success" });
        }
    });
});

$('#customer_reset').off('click').on('click', resetCustomerForm);

$("#customer-tbody").off('click').on('click', 'tr', function () {
    const clickedId = $(this).data('id');
    const obj = customer_db.find(c => c.id === clickedId);
    selectedIndex = customer_db.findIndex(c => c.id === clickedId);

    if (!obj) return;

    $("#cus-id").val(obj.id);
    $("#fname").val(obj.fname);
    $("#lname").val(obj.lname);
    $("#address").val(obj.address);
    $("#email").val(obj.email);
    $("#phone").val(obj.phone);
});