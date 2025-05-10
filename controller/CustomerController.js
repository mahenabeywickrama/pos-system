import {customer_db} from "/db/db.js";
import CustomerModel from "/model/CustomerModel.js";

let selectedIndex = -1;

$(document).ready(function() {
    loadCustomers();
    resetCustomerForm();
});

function generateNextCustomerId() {
    if (customer_db.length === 0) {
        return 'C001';
    }

    let lastId = customer_db[customer_db.length - 1].id;
    let number = parseInt(lastId.replace('C', '')) + 1;

    return 'C' + number.toString().padStart(3, '0');
}

function resetCustomerForm() {
    $('#cusid').val(generateNextCustomerId());
    $('#fname, #lname, #email, #phone, #address').val('');
    selectedIndex = -1;
}

function loadCustomers() {
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

$('#customer_save').on('click', function(){
    let id = $('#cusid').val().trim();
    let fname = $('#fname').val().trim();
    let lname = $('#lname').val().trim();
    let address = $('#address').val().trim();
    let email = $('#email').val().trim();
    let phone = $('#phone').val().trim();

    if (!id || !fname || !lname || !address) {
        Swal.fire({title: "Error!", text: "Please fill required fields", icon: "error"});
        return;
    }

    if (customer_db.some(c => c.id === id)) {
        Swal.fire({title: "Error!", text: "Customer ID already exists!", icon: "error"});
        return;
    }

    const customer = new CustomerModel(id, fname, lname, address, email, phone);
    customer_db.push(customer);

    loadCustomers();
    resetCustomerForm();

    Swal.fire({title: "Added Successfully!", icon: "success"});
});

$('#customer_update').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({title: "No Selection!", text: "Please select a customer to update.", icon: "info", confirmButtonText: "Ok"})
        return;
    }

    let id = $('#cusid').val();
    let fname = $('#fname').val();
    let lname = $('#lname').val();
    let address = $('#address').val();
    let email = $('#email').val();
    let phone = $('#phone').val();

    customer_db[selectedIndex] = new CustomerModel(id, fname, lname, address, email, phone);

    loadCustomers();
    resetCustomerForm();

    Swal.fire({title: "Updated Successfully!", icon: "success", draggable: true});
})

$('#customer_delete').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({title: "No Selection!", text: "Please select a customer to delete.", icon: "info", confirmButtonText: "Ok"})
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

            Swal.fire({title: "Deleted Successfully!", icon: "success"});
        }
    });
});


$('#customer_reset').on('click', resetCustomerForm);

$("#customer-tbody").on('click', 'tr', function(){
    const clickedId = $(this).data('id');
    const obj = customer_db.find(c => c.id === clickedId);
    selectedIndex = customer_db.findIndex(c => c.id === clickedId);

    if (!obj) return;

    $("#cusid").val(obj.id);
    $("#fname").val(obj.fname);
    $("#lname").val(obj.lname);
    $("#address").val(obj.address);
    $("#email").val(obj.email);
    $("#phone").val(obj.phone);
});