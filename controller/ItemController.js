import {item_db} from "/db/db.js";
import ItemModel from "/model/ItemModel.js";

let selectedIndex = -1;

// $(document).ready(function() {
//     loadItems();
//     resetItemForm();
// });

function generateNextItemId() {
    if (item_db.length === 0) {
        return 'I001';
    }

    let lastId = item_db[item_db.length - 1].id;
    let number = parseInt(lastId.replace('I', '')) + 1;

    return 'I' + number.toString().padStart(3, '0');
}

export function resetItemForm() {
    $('#item-id').val(generateNextItemId())
    $('#item, #qty, #price, #description').val('');
    selectedIndex = -1;
}

export function loadItems() {
    const tbody = $('#item-tbody');
    tbody.empty();

    item_db.forEach((item) => {
        let data = `<tr data-id="${item.id}">
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.qty}</td>
                        <td>${item.price}</td>
                        <td>${item.description}</td>
                    </tr>`;
        tbody.append(data);
    });
}

$('#item_save').off('click').on('click', function(){
    let id = $('#item-id').val().trim();
    let name = $('#item').val().trim();
    let qty = $('#qty').val().trim();
    let price = $('#price').val().trim();
    let description = $('#description').val().trim();

    if (!id || !name || !qty || !price || !description) {
        Swal.fire({title: "Error!", text: "Please fill required fields", icon: "error"});
        return;
    }

    if (item_db.some(i => i.id === id)) {
        Swal.fire({title: "Error!", text: "Item ID already exists!", icon: "error"});
        return;
    }

    const item = new ItemModel(id, name, qty, price, description);
    item_db.push(item);

    loadItems();
    resetItemForm();

    Swal.fire({title: "Added Successfully!", icon: "success"});
});

$('#item_update').off('click').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({title: "No Selection!", text: "Please select a item to update.", icon: "info", confirmButtonText: "Ok"})
        return;
    }

    let id = $('#item-id').val();
    let name = $('#item').val();
    let qty = $('#qty').val();
    let price = $('#price').val();
    let description = $('#description').val();

    item_db[selectedIndex] = new ItemModel(id, name, qty, price, description);

    loadItems();
    resetItemForm();

    Swal.fire({title: "Updated Successfully!", icon: "success", draggable: true});
})

$('#item_delete').off('click').on('click', function () {
    if (selectedIndex === -1) {
        Swal.fire({title: "No Selection!", text: "Please select a item to delete.", icon: "info", confirmButtonText: "Ok"})
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: 'This item will be removed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            item_db.splice(selectedIndex, 1);
            loadItems();
            resetItemForm();

            Swal.fire({title: "Deleted Successfully!", icon: "success"});
        }
    });
});

$('#item_reset').off('click').on('click', resetItemForm);

$("#item-tbody").off('click').on('click', 'tr', function(){
    const clickedId = $(this).data('id');
    const obj = item_db.find(i => i.id === clickedId);
    selectedIndex = item_db.findIndex(i => i.id === clickedId);

    if (!obj) return;

    $("#item-id").val(obj.id);
    $("#item").val(obj.name);
    $("#qty").val(obj.qty);
    $("#price").val(obj.price);
    $("#description").val(obj.description);
});