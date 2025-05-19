export default class OrdersItemModel {
    constructor(orderId, itemId, qty, price) {
        this.orderId = orderId;
        this.itemId = itemId;
        this.qty = qty;
        this.price = price;
    }
}